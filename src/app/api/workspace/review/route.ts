import {validSelection} from "@/accounts/security";
import {AccountError} from "@/accounts/github";
import {workspaceAccess,readInput,privateHeaders,workspaceError} from "@/workspace/access";
import {createJob} from "@/workspace/jobs";
export async function POST(request:Request){try{const {runtime,session}=await workspaceAccess(request);const input=await readInput(request);if(!validSelection(input))throw new AccountError(400,"Choose a repository and pull request.");const id=await createJob(runtime,session,input);return Response.json({id,href:`/workspace/jobs/${id}`},{status:202,headers:privateHeaders});}catch(error){return workspaceError(error);}}
