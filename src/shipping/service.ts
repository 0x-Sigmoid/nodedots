import type {AccountRuntime} from "@/accounts/runtime";
import {github} from "@/accounts/github";
import {createAppJwt} from "@/github/app-auth";
import {unseal} from "@/accounts/security";
import {defaultSettings,emptyBrief,checkState,type Settings,type Brief,type Check} from "./model";
export async function settingsFor(runtime:AccountRuntime,installation:number,repository:number){const row=await runtime.db.prepare("SELECT settings_cipher,updated_at FROM shipping_settings WHERE installation_id=? AND repo_id=?").bind(installation,repository).first<{settings_cipher:string;updated_at:number}>();return {settings:row?unseal<Settings>(row.settings_cipher,runtime.secret)??defaultSettings:defaultSettings,updatedAt:row?.updated_at??null};}
export async function briefFor(runtime:AccountRuntime,installation:number,repository:number,pull:number){const row=await runtime.db.prepare("SELECT brief_cipher,updated_at FROM shipping_briefs WHERE installation_id=? AND repo_id=? AND pr_number=?").bind(installation,repository,pull).first<{brief_cipher:string;updated_at:number}>();return {brief:row?unseal<Brief>(row.brief_cipher,runtime.secret)??emptyBrief:emptyBrief,updatedAt:row?.updated_at??null};}
export async function checksFor(token:string,repo:string,head:string){
 const checks:Check[]=[];const errors:string[]=[];
 const results=await Promise.allSettled([
  (async()=>{for(let page=1;page<=5;page++){const data=await github<{total_count:number;check_runs:{name:string;status:string;conclusion:string|null;html_url:string}[]}>(token,`/repos/${repo}/commits/${head}/check-runs?per_page=100&page=${page}&filter=latest`);checks.push(...data.check_runs.map(c=>({name:c.name,state:checkState(c.status,c.conclusion),url:safeGithubUrl(c.html_url)})));if(data.check_runs.length<100)return;}errors.push("Check-run list truncated after 500 results.");})(),
  (async()=>{const data=await github<{total_count:number;statuses:{context:string;state:string;target_url:string|null}[]}>(token,`/repos/${repo}/commits/${head}/status?per_page=100`);checks.push(...data.statuses.map(c=>({name:c.context,state:c.state==="success"?"passed" as const:c.state==="pending"?"pending" as const:"failed" as const,url:safeGithubUrl(c.target_url)})));if(data.total_count>100)errors.push("Commit-status list is limited to 100 results.");})()
 ]);
 results.forEach((r,i)=>{if(r.status==="rejected")errors.push(i?"Commit statuses are unavailable. Check GitHub access.":"Check runs are unavailable. Check GitHub access.");});
 return {checks,errors,checkedAt:Date.now(),head};
}
export function safeGithubUrl(value:string|null){if(!value)return null;try{const url=new URL(value);return url.protocol==="https:"&&!url.username&&!url.password?url.href:null;}catch{return null;}}
export async function webhookHealth(runtime:AccountRuntime,repository:number){
 if(!runtime.appId||!runtime.privateKey||!runtime.webhookSecret)return {configured:false,eventSubscribed:false,urlMatches:false,lastDelivery:null,verified:false};
 try{const jwt=createAppJwt(runtime.appId,runtime.privateKey);const [app,config,deliveries]=await Promise.all([
  github<{events:string[];permissions:Record<string,string>}>(jwt,"/app"),github<{url:string;insecure_ssl:string}>(jwt,"/app/hook/config"),github<{repository_id:number|null;status_code:number;delivered_at:string;event:string}[]>(jwt,"/app/hook/deliveries?per_page=100")
 ]);const row=deliveries.find(d=>d.repository_id===repository&&d.event==="pull_request");return {configured:true,verified:true,eventSubscribed:app.events.includes("pull_request"),urlMatches:config.url===`${runtime.origin}/api/workspace/github`&&String(config.insecure_ssl)==="0",permissions:app.permissions,lastDelivery:row?{status:row.status_code,at:row.delivered_at}:null};}catch{return {configured:true,verified:false,eventSubscribed:false,urlMatches:false,lastDelivery:null};}
}
