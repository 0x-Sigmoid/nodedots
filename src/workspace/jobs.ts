import {getCloudflareContext} from "@opennextjs/cloudflare";
import {after} from "next/server";
import type {Queue} from "@cloudflare/workers-types";
import type {AccountRuntime,AccountSession} from "@/accounts/runtime";
import {authorizedRepository,github,AccountError} from "@/accounts/github";
import {seal,unseal} from "@/accounts/security";
import {githubSnapshotProvider,GitHubApiError} from "@/github/retrieval";
import {mintInstallationToken} from "@/github/app-auth";
import {analyze} from "@/engine";
import {findings,type Job} from "./model";

export async function enqueue(id:string) {
 const {env}=await getCloudflareContext({async:true});
 const queue=(env as unknown as {WORKSPACE_QUEUE?:Queue<{id:string}>}).WORKSPACE_QUEUE;
 if(!queue) throw new AccountError(503,"Background reviews are being configured. Please try again shortly.");
 await queue.send({id});
}
export async function scheduleJob(runtime:AccountRuntime,id:string){
 if(process.env.NODE_ENV==="development"){after(async()=>{await executeJob(runtime,id);});return;}
 await enqueue(id);
}
export async function createJob(runtime:AccountRuntime,session:AccountSession,input:{installation:number;repository:number;pull:number},automatic=false) {
 const repo=await authorizedRepository(session.token,input.installation,input.repository,runtime.slug);
 if(repo.private&&!runtime.privateRepositories)throw new AccountError(403,"Connect a public repository for this beta.");
 const pr=await github<{title:string;head:{sha:string};base:{sha:string}}>(session.token,`/repos/${repo.owner.login}/${repo.name}/pulls/${input.pull}`);
 const existing=await runtime.db.prepare("SELECT id,status,expires_at FROM workspace_jobs WHERE github_id=? AND repo_id=? AND pr_number=? AND head_sha=? AND base_sha=?").bind(session.githubId,repo.id,input.pull,pr.head.sha,pr.base.sha).first<{id:string;status:string;expires_at:number}>();
 if(existing&&existing.expires_at>Date.now()&&existing.status!=="failed")return existing.id;
 const now=Date.now(),id=existing?.id??crypto.randomUUID();
 const claim=await runtime.db.prepare("INSERT INTO account_rate_limits(key,expires_at) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET expires_at=excluded.expires_at WHERE account_rate_limits.expires_at<=? RETURNING key").bind(`review:${session.githubId}`,now+60000,now).first();
 if(!claim)throw new AccountError(429,"Please wait a minute before starting another review.");
 await runtime.db.prepare("INSERT INTO workspace_jobs(id,github_id,installation_id,repo_id,owner,repo,pr_number,title,head_sha,base_sha,token_cipher,automatic,created_at,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(github_id,repo_id,pr_number,head_sha,base_sha) DO UPDATE SET status='queued',stage='queued',error=NULL,attempts=0,lease=NULL,token_cipher=excluded.token_cipher,automatic=excluded.automatic,updated_at=excluded.updated_at,expires_at=excluded.expires_at").bind(id,session.githubId,input.installation,repo.id,repo.owner.login,repo.name,input.pull,pr.title,pr.head.sha,pr.base.sha,automatic?null:seal(session.token,runtime.secret),automatic?1:0,now,now,now+7*86400000).run();
 try{await scheduleJob(runtime,id);}catch(error){await runtime.db.prepare("UPDATE workspace_jobs SET status='failed',stage='failed',error=?,token_cipher=NULL WHERE id=?").bind("Could not queue the review. Try again.",id).run();throw error;}
 return id;
}
export async function executeJob(runtime:AccountRuntime,id:string) {
 const now=Date.now(),lease=crypto.randomUUID();
 const job=await runtime.db.prepare("UPDATE workspace_jobs SET status='running',stage='retrieving',error=NULL,updated_at=?,lease=?,attempts=attempts+1 WHERE id=? AND expires_at>? AND (status='queued' OR (status='running' AND updated_at<?)) RETURNING *").bind(now,lease,id,now,now-180000).first<Job>();
 if(!job){const row=await runtime.db.prepare("SELECT status FROM workspace_jobs WHERE id=?").bind(id).first<{status:string}>();return row?.status==="running"?"busy":"done";}
 const stage=async(value:string)=>{const update=await runtime.db.prepare("UPDATE workspace_jobs SET stage=?,updated_at=? WHERE id=? AND lease=?").bind(value,Date.now(),id,lease).run();if(!update.meta.changes)throw new Error("lease-replaced");};
 let token=job.token_cipher?unseal<string>(job.token_cipher,runtime.secret):null;
 try {
  if(job.automatic){
   const enabled=await runtime.db.prepare("SELECT enabled FROM workspace_automation WHERE github_id=? AND repo_id=? AND installation_id=?").bind(job.github_id,job.repo_id,job.installation_id).first<{enabled:number}>();
   if(!enabled?.enabled||!runtime.appId||!runtime.privateKey)throw new Error("automation-unavailable");
   token=(await mintInstallationToken({appId:runtime.appId,privateKeyPem:runtime.privateKey,installationId:job.installation_id})).token;
  }
  if(!token)throw new Error("session-expired");
  async function verifyAccess(){if(!job)return; if(job.automatic){const repo=await github<{id:number;private:boolean}>(token!,`/repos/${job.owner}/${job.repo}`);if(repo.id!==job.repo_id||(repo.private&&!runtime.privateRepositories))throw new Error("access-revoked");}else await authorizedRepository(token!,job.installation_id,job.repo_id,runtime.slug);}
  await verifyAccess();
  const path=`/repos/${job.owner}/${job.repo}/pulls/${job.pr_number}`;
  const pr=await github<{head:{sha:string;repo:{name:string;owner:{login:string};fork:boolean}|null};base:{sha:string}}>(token,path);
  if(!pr.head.repo)throw new Error("head-unavailable");
  if(pr.head.sha!==job.head_sha||pr.base.sha!==job.base_sha)throw new Error("snapshot-superseded");
  if(job.automatic){const check=await publishCheck(token,job,{status:"in_progress",output:{title:"Reviewing connected code",summary:"Advisory analysis in progress."}});await runtime.db.prepare("UPDATE workspace_jobs SET check_id=? WHERE id=?").bind(check.id,id).run();job.check_id=check.id;}
  const deadline=Date.now()+90000;
  const boundedFetch:typeof fetch=(url,options)=>fetch(url,{...options,cache:"no-store",signal:AbortSignal.timeout(Math.max(1,Math.min(15000,deadline-Date.now())))});
  const snapshot=await githubSnapshotProvider({token,get:boundedFetch})({owner:job.owner,repo:job.repo,number:job.pr_number,headSha:job.head_sha,baseSha:job.base_sha,headOwner:pr.head.repo.owner.login,headRepo:pr.head.repo.name,isFork:pr.head.repo.fork,installationId:job.installation_id});
  const report=await analyze(snapshot,{enrichment:false,onStage:stage});await verifyAccess();
  const latest=await github<{head:{sha:string};base:{sha:string}}>(token,path);
  if(latest.head.sha!==job.head_sha||latest.base.sha!==job.base_sha)throw new Error("snapshot-superseded");
  const cipher=seal(report,runtime.secret);if(cipher.length>1000000)throw new Error("report-limit");
  const reviewId=id;
  const persisted=await runtime.db.batch([
   runtime.db.prepare("INSERT INTO workspace_reviews(id,github_id,installation_id,repo_id,owner,repo,pr_number,head_sha,base_sha,report_cipher,created_at,expires_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM workspace_jobs WHERE id=? AND lease=?) ON CONFLICT(id) DO UPDATE SET report_cipher=excluded.report_cipher,created_at=excluded.created_at,expires_at=excluded.expires_at").bind(reviewId,job.github_id,job.installation_id,job.repo_id,job.owner,job.repo,job.pr_number,job.head_sha,job.base_sha,cipher,Date.now(),Date.now()+7*86400000,id,lease),
   runtime.db.prepare("UPDATE workspace_jobs SET review_id=?,status='completed',stage='completed',token_cipher=NULL,updated_at=? WHERE id=? AND lease=?").bind(reviewId,Date.now(),id,lease)
  ]);
  if(!persisted[1].meta.changes)return "busy";
  if(job.automatic){try{await publishCheck(token,job,{status:"completed",conclusion:"neutral",details_url:`${runtime.origin}/workspace/reviews/${reviewId}`,output:{title:`${findings(report).length} observations · ${report.coverage.completeness} coverage`,summary:`${report.changed.length} changed files; ${report.affected.length} affected files. Review evidence and coverage before acting. This check is advisory.`}});}catch{await runtime.db.prepare("UPDATE workspace_jobs SET error=? WHERE id=?").bind("Report ready; GitHub check could not be updated.",id).run();}}
  return "done";
 }catch(error){
  const owns=await runtime.db.prepare("SELECT id FROM workspace_jobs WHERE id=? AND lease=?").bind(id,lease).first();if(!owns)return "busy";
  if(job.attempts<4&&((error instanceof GitHubApiError&&(error.status===429||error.status>=500))||(error instanceof AccountError&&error.status===502))){await runtime.db.prepare("UPDATE workspace_jobs SET status='queued',stage='queued',error=?,updated_at=? WHERE id=? AND lease=?").bind("GitHub is temporarily unavailable. The background review will retry.",Date.now(),id,lease).run();return "busy";}
  if(job.automatic&&token&&job.check_id){try{await publishCheck(token,job,{status:"completed",conclusion:"neutral",output:{title:"Review interrupted",summary:"Analysis could not finish. Retry from the NodeDots inbox. This is not a code verdict."}});}catch{/* A failed check update never becomes a success verdict. */}}
  await runtime.db.prepare("UPDATE workspace_jobs SET status='failed',stage='failed',error=?,token_cipher=NULL,updated_at=? WHERE id=? AND lease=?").bind("Review interrupted. Check repository access and retry from the inbox.",Date.now(),id,lease).run();
  return "done";
 }
}
async function publishCheck(token:string,job:Job,payload:Record<string,unknown>) {
 const response=await fetch(`https://api.github.com/repos/${job.owner}/${job.repo}/check-runs${job.check_id?`/${job.check_id}`:""}`,{method:job.check_id?"PATCH":"POST",headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","User-Agent":"NodeDots-Code","Content-Type":"application/json"},body:JSON.stringify({name:"NodeDots change review",head_sha:job.head_sha,external_id:job.id,...payload}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error("check-publication");return response.json() as Promise<{id:number}>;
}
