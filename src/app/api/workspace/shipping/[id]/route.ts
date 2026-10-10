import {AccountError,github} from "@/accounts/github";
import {seal,unseal,validMutation} from "@/accounts/security";
import {reviewAccess,workspaceError,privateHeaders,readInput} from "@/workspace/access";
import {findings} from "@/workspace/model";
import {settingsFor,briefFor,checksFor} from "@/shipping/service";
import {checklist,requiredCheckStates} from "@/shipping/model";
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,{params}:Context){try{
 const {id}=await params,{runtime,session,row,report}=await reviewAccess(id),repository=`${row.owner}/${row.repo}`;
 const [policy,intent,ci,pullResult,reviewsResult,actions,feedback,shares]=await Promise.all([
  settingsFor(runtime,row.installation_id,row.repo_id),briefFor(runtime,row.installation_id,row.repo_id,row.pr_number),checksFor(session.token,repository,row.head_sha),
  github<{head:{sha:string};base:{sha:string};draft:boolean;state:string}>(session.token,`/repos/${repository}/pulls/${row.pr_number}`).then(value=>({value,error:false})).catch(()=>({value:null,error:true})),
  github<{user:{login:string};state:string;commit_id:string}[]>(session.token,`/repos/${repository}/pulls/${row.pr_number}/reviews?per_page=100`).catch(()=>null),
  runtime.db.prepare("SELECT item_key,status,note_cipher,login,created_at FROM shipping_actions WHERE review_id=? ORDER BY id ASC").bind(id).all<{item_key:string;status:string;note_cipher:string;login:string;created_at:number}>(),
  runtime.db.prepare("SELECT github_id,fingerprint,disposition,created_at FROM workspace_feedback WHERE review_id=? ORDER BY id ASC").bind(id).all<{github_id:number;fingerprint:string;disposition:string;created_at:number}>(),
  runtime.db.prepare("SELECT github_id,login FROM workspace_shares WHERE review_id=?").bind(id).all()
 ]);
 const decisions=new Map<string,typeof feedback.results[number]>();for(const event of feedback.results)decisions.set(`${event.github_id}:${event.fingerprint}`,event);
 const required=findings(report).filter(f=>policy.settings.acknowledge==="all"||(policy.settings.acknowledge==="high"&&f.severity==="high"));
 const acknowledged=new Set([...decisions.values()].filter(e=>e.disposition!=="cleared").map(e=>e.fingerprint));
 const actionMap=new Map(actions.results.map(a=>[a.item_key,{status:a.status,note:unseal<string>(a.note_cipher,runtime.secret)??"",actor:a.login,at:a.created_at}]));
 const reviewers=policy.settings.reviewers.map(login=>{const latest=reviewsResult?.filter(r=>r.user.login.toLowerCase()===login.toLowerCase()&&r.state!=="COMMENTED"&&r.state!=="PENDING").at(-1);return {login,state:reviewsResult===null||reviewsResult.length===100?"unavailable":latest?.commit_id!==row.head_sha?"awaiting current commit":latest.state.toLowerCase()};});
 return Response.json({settings:policy.settings,decisions:[...decisions.values()],brief:intent.brief,briefUpdatedAt:intent.updatedAt,ci,requiredChecks:requiredCheckStates(ci.checks,policy.settings.requiredChecks),freshness:pullResult.error?"unavailable":pullResult.value?.head.sha===row.head_sha&&pullResult.value?.base.sha===row.base_sha?"current":"stale",draft:pullResult.value?.draft??null,pullState:pullResult.value?.state??"unavailable",reviewers,reviewersTruncated:reviewsResult?.length===100,policy:{required:required.length,acknowledged:required.filter(f=>acknowledged.has(f.fingerprint)).length},items:checklist(report,policy.settings,intent.brief).map(item=>({...item,...actionMap.get(item.key)})),shares:row.github_id===session.githubId?shares.results:[],canShare:row.github_id===session.githubId,head:row.head_sha,coverage:report.coverage.completeness,unknowns:report.unknown.length},{headers:privateHeaders});
 }catch(error){return workspaceError(error);}}
export async function POST(request:Request,{params}:Context){try{
 const {id}=await params,{runtime,session,row,report}=await reviewAccess(id);
 if(!validMutation(request,runtime.origin))throw new AccountError(403,"This request is not allowed.");
 const input=await readInput(request,6000),[{settings},{brief}]=await Promise.all([settingsFor(runtime,row.installation_id,row.repo_id),briefFor(runtime,row.installation_id,row.repo_id,row.pr_number)]);
 if(typeof input.key!=="string"||!checklist(report,settings,brief).some(i=>i.key===input.key)||!["done","not_applicable","pending"].includes(String(input.status))||typeof input.note!=="string"||input.note.length>2000)throw new AccountError(400,"Choose a valid checklist item, status, and note.");
 if(input.status!=="pending"&&!input.note.trim())throw new AccountError(400,"Add evidence or a reason for your assessment.");
 await runtime.db.prepare("INSERT INTO shipping_actions(review_id,item_key,status,note_cipher,github_id,login,created_at) VALUES(?,?,?,?,?,?,?)").bind(id,input.key,input.status,seal(input.note.trim(),runtime.secret),session.githubId,session.login,Date.now()).run();
 return Response.json({saved:true},{headers:privateHeaders});
 }catch(error){return workspaceError(error);}}
