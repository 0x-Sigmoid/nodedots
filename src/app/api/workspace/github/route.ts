import {accountRuntime} from "@/accounts/runtime";
import {verifySignature,MAX_WEBHOOK_BYTES,supportedPullRequestAction} from "@/github/verify";
import {mintInstallationToken} from "@/github/app-auth";
import {AccountError,github} from "@/accounts/github";
import {privateHeaders,workspaceError} from "@/workspace/access";
export async function POST(request:Request){try{
 const runtime=await accountRuntime();if(!runtime.webhookSecret||!runtime.appId||!runtime.privateKey)return Response.json({message:"Automation is not configured."},{status:503});
 const reader=request.body?.getReader();if(!reader)throw new AccountError(400,"Missing payload.");const chunks:Uint8Array[]=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_WEBHOOK_BYTES){await reader.cancel();throw new AccountError(413,"Payload too large.");}chunks.push(value);}const raw=Buffer.concat(chunks);
 if(!verifySignature(runtime.webhookSecret,raw,request.headers.get("x-hub-signature-256")))throw new AccountError(401,"Invalid signature.");
 const delivery=request.headers.get("x-github-delivery"),event=request.headers.get("x-github-event");if(!delivery||delivery.length>100)throw new AccountError(400,"Missing delivery identifier.");
 if(event==="ping")return Response.json({message:"pong"});if(event!=="pull_request")return Response.json({message:"Event ignored."});
 const payload=JSON.parse(raw.toString()) as {action:string;installation?:{id:number};repository?:{id:number;full_name:string;private:boolean};pull_request?:{number:number;draft:boolean}};
 if(!supportedPullRequestAction(payload.action)||!payload.installation||!payload.repository||!payload.pull_request||payload.pull_request.draft)return Response.json({message:"Event ignored."});
 if(payload.repository.private&&!runtime.privateRepositories)return Response.json({message:"Repository is outside beta scope."});
 if(await runtime.db.prepare("SELECT id FROM workspace_deliveries WHERE id=?").bind(delivery).first())return Response.json({message:"Already received."});
 const settings=await runtime.db.prepare("SELECT github_id,installation_id FROM workspace_automation WHERE repo_id=? AND installation_id=? AND enabled=1 ORDER BY updated_at ASC LIMIT 1").bind(payload.repository.id,payload.installation.id).all<{github_id:number;installation_id:number}>();
 if(settings.results.length){const token=(await mintInstallationToken({appId:runtime.appId,privateKeyPem:runtime.privateKey,installationId:payload.installation.id})).token;const verified=await github<{id:number;private:boolean}>(token,`/repos/${payload.repository.full_name}`);if(verified.id!==payload.repository.id||(verified.private&&!runtime.privateRepositories))throw new AccountError(403,"Repository unavailable.");
 // The installation token is verified here. createJob's user-access validation cannot be used with it.
 const {queueAutomaticJob}=await import("@/workspace/automatic");for(const setting of settings.results)await queueAutomaticJob(runtime,token,{githubId:setting.github_id,installation:setting.installation_id,repository:verified.id,fullName:payload.repository.full_name,pull:payload.pull_request.number});}
 await runtime.db.prepare("INSERT OR IGNORE INTO workspace_deliveries(id,received_at) VALUES(?,?)").bind(delivery,Date.now()).run();return Response.json({message:"Received."},{status:202,headers:privateHeaders});
 }catch(error){return workspaceError(error);}}
