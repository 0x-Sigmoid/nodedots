import type { Finding, ImpactReport } from "@/engine/types";
export const stages = ["queued", "retrieving", "mapping", "checking", "preparing", "completed"] as const;
export const stageLabels: Record<string,string> = {queued:"Waiting to start",retrieving:"Reading pinned source",mapping:"Mapping relationships",checking:"Checking for gaps",preparing:"Preparing your report",completed:"Review ready",failed:"Review interrupted"};
export function findings(report: ImpactReport): Finding[] {
 const rank={high:0,medium:1,low:2};
 return [...new Map([...report.missing,...report.conflicting,...report.uncertain,...report.untested,...report.actionRequired].map(f=>[f.fingerprint,f])).values()].sort((a,b)=>rank[a.severity]-rank[b.severity]||Number(a.state==="UNCERTAIN")-Number(b.state==="UNCERTAIN"));
}
export function parsePullUrl(value: string) {
 try {const url=new URL(value);if(url.protocol!=="https:"||url.hostname!=="github.com"||url.username||url.password)return null;const match=url.pathname.match(/^\/([\w.-]+)\/([\w.-]+)\/pull\/([1-9]\d*)\/?$/);if(!match||!Number.isSafeInteger(Number(match[3])))return null;return {owner:match[1],repo:match[2],pull:Number(match[3])};}catch{return null;}
}
export function comparison(current:ImpactReport,previous:ImpactReport) {
 const before=new Set(findings(previous).map(f=>f.fingerprint)),after=new Set(findings(current).map(f=>f.fingerprint));
 return {new: [...after].filter(id=>!before.has(id)).length,persisting:[...after].filter(id=>before.has(id)).length,noLongerObserved:[...before].filter(id=>!after.has(id)).length};
}
export type Job = {id:string;github_id:number;installation_id:number;repo_id:number;owner:string;repo:string;pr_number:number;title:string;head_sha:string;base_sha:string;token_cipher:string|null;status:string;stage:string;error:string|null;review_id:string|null;automatic:number;check_id:number|null;created_at:number;updated_at:number;expires_at:number;lease:string;attempts:number};
