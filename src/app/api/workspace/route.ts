import { accountRuntime,currentSession } from "@/accounts/runtime";
import { AccountError,github,installations,repositories,authorizedRepository } from "@/accounts/github";
const headers={"Cache-Control":"private, no-store"};
export async function GET(request:Request) {
 try {
  const runtime=await accountRuntime(),session=await currentSession(runtime);
  if(!session) return Response.json({message:"Sign in to continue."},{status:401,headers});
  const query=new URL(request.url).searchParams;
  const installation=Number(query.get("installation")),repository=Number(query.get("repository"));
  if(!query.has("installation")) return Response.json({installations:await installations(session.token,runtime.slug)},{headers});
  if(!Number.isSafeInteger(installation)||installation<=0) throw new AccountError(400,"Choose a valid installation.");
  if(!query.has("repository")) return Response.json({repositories:(await repositories(session.token,installation,runtime.slug)).filter(repo=>runtime.privateRepositories||!repo.private)},{headers});
  if(!Number.isSafeInteger(repository)||repository<=0) throw new AccountError(400,"Choose a valid repository.");
  const repo=await authorizedRepository(session.token,installation,repository,runtime.slug);
  if(repo.private&&!runtime.privateRepositories) throw new AccountError(403,"Private repository access is not enabled for this beta.");
  const pulls=await github(session.token,`/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/pulls?state=open&per_page=100`);
  return Response.json({pulls},{headers});
 } catch(error) { return Response.json({message:error instanceof AccountError?error.message:"The workspace is unavailable. Try again shortly."},{status:error instanceof AccountError?error.status:503,headers}); }
}
