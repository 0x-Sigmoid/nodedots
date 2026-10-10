import { accountRuntime,currentSession } from "@/accounts/runtime";
import { AccountError,github,authorizedRepository } from "@/accounts/github";
import { validMutation,validSelection,seal } from "@/accounts/security";
import { githubSnapshotProvider } from "@/github/retrieval";
import { analyze } from "@/engine";
const headers={"Cache-Control":"private, no-store"};
export async function POST(request:Request) {
 try {
  const runtime=await accountRuntime();
  if(!validMutation(request,runtime.origin)) throw new AccountError(403,"This request is not allowed.");
  const session=await currentSession(runtime);
  if(!session) throw new AccountError(401,"Sign in to continue.");
  const reader=request.body?.getReader();
  if(!reader) throw new AccountError(400,"Choose a repository and pull request.");
  let text="",size=0;
  const decoder=new TextDecoder();
  for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>2048){await reader.cancel();throw new AccountError(400,"Invalid selection.");}text+=decoder.decode(chunk.value,{stream:true});}
  text+=decoder.decode();
  const input:unknown=JSON.parse(text);
  if(!validSelection(input)) throw new AccountError(400,"Choose a repository and pull request.");
  const repo=await authorizedRepository(session.token,input.installation,input.repository,runtime.slug);
  if(repo.private&&!runtime.privateRepositories) throw new AccountError(403,"Private repository access is not enabled for this beta.");
  const now=Date.now();
  const claim=await runtime.db.prepare("INSERT INTO account_rate_limits(key,expires_at) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET expires_at=excluded.expires_at WHERE account_rate_limits.expires_at <= ? RETURNING key").bind(`review:${session.githubId}`,now+60000,now).first();
  if(!claim) throw new AccountError(429,"Please wait a minute before starting another review.");
  const pr=await github<{number:number;head:{sha:string;repo:{name:string;owner:{login:string};fork:boolean}|null};base:{sha:string}}>(session.token,`/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/pulls/${input.pull}`);
  if(!pr.head.repo) throw new AccountError(400,"This pull request's source repository is no longer available.");
  const deadline=Date.now()+90000;
  const boundedFetch:typeof fetch=(url,options)=>fetch(url,{...options,cache:"no-store",signal:AbortSignal.timeout(Math.max(1,Math.min(15000,deadline-Date.now())))});
  const snapshot=await githubSnapshotProvider({token:session.token,get:boundedFetch})({owner:repo.owner.login,repo:repo.name,number:pr.number,headSha:pr.head.sha,baseSha:pr.base.sha,headOwner:pr.head.repo.owner.login,headRepo:pr.head.repo.name,isFork:pr.head.repo.fork,installationId:input.installation});
  const report=await analyze(snapshot);
  // Revalidate before persisting, including uninstall, repository removal and user access changes.
  await authorizedRepository(session.token,input.installation,input.repository,runtime.slug);
  const cipher=seal(report,runtime.secret);
  if(cipher.length>1000000) throw new AccountError(422,"This review is too large for the beta workspace.");
  const id=crypto.randomUUID();
  await runtime.db.batch([
   runtime.db.prepare("DELETE FROM workspace_reviews WHERE expires_at <= ?").bind(now),
   runtime.db.prepare("INSERT INTO workspace_reviews(id,github_id,installation_id,repo_id,owner,repo,pr_number,head_sha,base_sha,report_cipher,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,session.githubId,input.installation,repo.id,repo.owner.login,repo.name,pr.number,pr.head.sha,pr.base.sha,cipher,now,now+7*86400000)
  ]);
  return Response.json({href:`/workspace/reviews/${id}`},{headers});
 } catch(error) {return Response.json({message:error instanceof AccountError?error.message:"The review could not finish. Check GitHub access and try again."},{status:error instanceof AccountError?error.status:503,headers});}
}
