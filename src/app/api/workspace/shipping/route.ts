import {AccountError,authorizedRepository,github} from "@/accounts/github";
import {seal} from "@/accounts/security";
import {workspaceAccess,workspaceError,privateHeaders,readInput} from "@/workspace/access";
import {settingsFor,briefFor,webhookHealth} from "@/shipping/service";
import {validSettings,validBrief} from "@/shipping/model";
async function selection(input:Record<string,unknown>,mutation?:Request){
 const access=await workspaceAccess(mutation);
 const installation=Number(input.installation),repository=Number(input.repository);
 if(!Number.isSafeInteger(installation)||installation<1||!Number.isSafeInteger(repository)||repository<1)throw new AccountError(400,"Choose a connected repository.");
 const repo=await authorizedRepository(access.session.token,installation,repository,access.runtime.slug);
 if(repo.private&&!access.runtime.privateRepositories)throw new AccountError(403,"Private repositories are unavailable.");
 return {...access,repo,installation,repository};
}
export async function GET(request:Request){try{
 const input=Object.fromEntries(new URL(request.url).searchParams),{runtime,session,repo,installation,repository}=await selection(input);
 const [settings,health,rights,automatic]=await Promise.all([settingsFor(runtime,installation,repository),webhookHealth(runtime,repository),github<{permissions?:{admin?:boolean;maintain?:boolean;push?:boolean}}>(session.token,`/repos/${repo.owner.login}/${repo.name}`),runtime.db.prepare("SELECT enabled FROM workspace_automation WHERE installation_id=? AND repo_id=? AND enabled=1 LIMIT 1").bind(installation,repository).first()]);
 const pull=Number(input.pull);const brief=Number.isSafeInteger(pull)&&pull>0?await briefFor(runtime,installation,repository,pull):null;
 return Response.json({...settings,health,automatic:!!automatic,canManage:!!(rights.permissions?.admin||rights.permissions?.maintain),canWriteBrief:!!(rights.permissions?.push||rights.permissions?.admin||rights.permissions?.maintain),...brief},{headers:privateHeaders});
 }catch(error){return workspaceError(error);}}
export async function POST(request:Request){try{
 const input=await readInput(request,16000),{runtime,session,repo,installation,repository}=await selection(input,request);
 const rights=await github<{permissions?:{admin?:boolean;maintain?:boolean;push?:boolean}}>(session.token,`/repos/${repo.owner.login}/${repo.name}`);
 if(input.updatedAt!==null&&(!Number.isSafeInteger(input.updatedAt)||Number(input.updatedAt)<0))throw new AccountError(400,"Load the current version before saving.");
 const now=Math.max(Date.now(),Number(input.updatedAt)+1);
 if(input.kind==="brief"){
  if(!rights.permissions?.push&&!rights.permissions?.admin&&!rights.permissions?.maintain)throw new AccountError(403,"Repository write access is required to edit a brief.");
  if(!Number.isSafeInteger(input.pull)||Number(input.pull)<1||!validBrief(input.brief))throw new AccountError(400,"Enter a valid pull request and brief.");
  await github(session.token,`/repos/${repo.owner.login}/${repo.name}/pulls/${input.pull}`);
  const result=await runtime.db.prepare("INSERT INTO shipping_briefs(installation_id,repo_id,pr_number,brief_cipher,updated_by,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(installation_id,repo_id,pr_number) DO UPDATE SET brief_cipher=excluded.brief_cipher,updated_by=excluded.updated_by,updated_at=excluded.updated_at WHERE shipping_briefs.updated_at=?").bind(installation,repository,input.pull,seal(input.brief,runtime.secret),session.githubId,now,input.updatedAt).run();
  if(!result.meta.changes)throw new AccountError(409,"The brief changed. Load the existing brief before saving again.");
 }else{
  if(!rights.permissions?.admin&&!rights.permissions?.maintain)throw new AccountError(403,"A repository administrator or maintainer must edit shipping policy.");
  if(!validSettings(input.settings))throw new AccountError(400,"Check policy fields and their limits.");
  const result=await runtime.db.prepare("INSERT INTO shipping_settings(installation_id,repo_id,settings_cipher,updated_by,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(installation_id,repo_id) DO UPDATE SET settings_cipher=excluded.settings_cipher,updated_by=excluded.updated_by,updated_at=excluded.updated_at WHERE shipping_settings.updated_at=?").bind(installation,repository,seal(input.settings,runtime.secret),session.githubId,now,input.updatedAt).run();
  if(!result.meta.changes)throw new AccountError(409,"The policy changed. Refresh Shipping setup before saving again.");
 }
 return Response.json({saved:true,updatedAt:now},{headers:privateHeaders});
 }catch(error){return workspaceError(error);}}
