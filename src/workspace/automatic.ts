import type {AccountRuntime} from "@/accounts/runtime";
import {github} from "@/accounts/github";
import {scheduleJob} from "./jobs";
export async function queueAutomaticJob(runtime:AccountRuntime,token:string,input:{githubId:number;installation:number;repository:number;fullName:string;pull:number}){
 const pr=await github<{title:string;head:{sha:string};base:{sha:string}}>(token,`/repos/${input.fullName}/pulls/${input.pull}`);const now=Date.now();const [owner,repo]=input.fullName.split("/");
 const existing=await runtime.db.prepare("SELECT id,status,expires_at FROM workspace_jobs WHERE github_id=? AND repo_id=? AND pr_number=? AND head_sha=? AND base_sha=?").bind(input.githubId,input.repository,input.pull,pr.head.sha,pr.base.sha).first<{id:string;status:string;expires_at:number}>();if(existing&&existing.expires_at>now&&existing.status!=="failed")return;
 const id=existing?.id??crypto.randomUUID();await runtime.db.prepare("INSERT INTO workspace_jobs(id,github_id,installation_id,repo_id,owner,repo,pr_number,title,head_sha,base_sha,automatic,created_at,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?,?) ON CONFLICT(github_id,repo_id,pr_number,head_sha,base_sha) DO UPDATE SET status='queued',stage='queued',error=NULL,attempts=0,lease=NULL,automatic=1,updated_at=excluded.updated_at,expires_at=excluded.expires_at").bind(id,input.githubId,input.installation,input.repository,owner,repo,input.pull,pr.title,pr.head.sha,pr.base.sha,now,now,now+7*86400000).run();
 try{await scheduleJob(runtime,id);}catch(error){await runtime.db.prepare("UPDATE workspace_jobs SET status='failed',stage='failed' WHERE id=?").bind(id).run();throw error;}
}
