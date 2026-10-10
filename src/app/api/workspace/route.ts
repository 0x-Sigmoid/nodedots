import { accountRuntime,currentSession } from "@/accounts/runtime";
import { AccountError,github,installations,repositories,authorizedRepository } from "@/accounts/github";
import {unseal} from "@/accounts/security";
import type {ImpactReport} from "@/engine/types";
import {findings} from "@/workspace/model";
const headers={"Cache-Control":"private, no-store"};
export async function GET(request:Request) {
 try {
  const runtime=await accountRuntime(),session=await currentSession(runtime);
  if(!session) return Response.json({message:"Sign in to continue."},{status:401,headers});
  const query=new URL(request.url).searchParams;
  const installation=Number(query.get("installation")),repository=Number(query.get("repository"));
  if(!query.has("installation")) return Response.json({installations:await installations(session.token,runtime.slug),preference:await runtime.db.prepare("SELECT installation_id,repo_id FROM workspace_preferences WHERE github_id=?").bind(session.githubId).first(),automationReady:!!(runtime.appId&&runtime.privateKey&&runtime.webhookSecret)},{headers});
  if(!Number.isSafeInteger(installation)||installation<=0) throw new AccountError(400,"Choose a valid installation.");
  if(!query.has("repository")) return Response.json({repositories:(await repositories(session.token,installation,runtime.slug)).filter(repo=>runtime.privateRepositories||!repo.private)},{headers});
  if(!Number.isSafeInteger(repository)||repository<=0) throw new AccountError(400,"Choose a valid repository.");
  const repo=await authorizedRepository(session.token,installation,repository,runtime.slug);
  if(repo.private&&!runtime.privateRepositories) throw new AccountError(403,"Private repository access is not enabled for this beta.");
  const pulls=await github(session.token,`/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/pulls?state=open&per_page=100`);
  const history=await runtime.db.prepare("SELECT id,pr_number,head_sha,base_sha,report_cipher,created_at FROM workspace_reviews WHERE github_id=? AND repo_id=? AND expires_at>? ORDER BY created_at DESC LIMIT 30").bind(session.githubId,repo.id,Date.now()).all<{id:string;pr_number:number;head_sha:string;base_sha:string;report_cipher:string;created_at:number}>();
  const jobs=await runtime.db.prepare("SELECT id,pr_number,title,head_sha,status,stage,error,review_id,created_at FROM workspace_jobs WHERE github_id=? AND repo_id=? AND expires_at>? ORDER BY created_at DESC LIMIT 30").bind(session.githubId,repo.id,Date.now()).all();
  const automatic=await runtime.db.prepare("SELECT enabled FROM workspace_automation WHERE github_id=? AND repo_id=?").bind(session.githubId,repo.id).first<{enabled:number}>();
  const reviews=history.results.map(row=>{const report=unseal<ImpactReport>(row.report_cipher,runtime.secret);return {id:row.id,pr_number:row.pr_number,head_sha:row.head_sha,created_at:row.created_at,findings:report?findings(report).length:0,coverage:report?.coverage.completeness??"unknown",analyzedFiles:report?.coverage.analyzedFiles??0};});
  return Response.json({pulls,reviews,jobs:jobs.results,automatic:!!automatic?.enabled},{headers});
 } catch(error) { return Response.json({message:error instanceof AccountError?error.message:"The workspace is unavailable. Try again shortly."},{status:error instanceof AccountError?error.status:503,headers}); }
}
