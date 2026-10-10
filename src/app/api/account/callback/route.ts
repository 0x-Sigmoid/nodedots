import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { accountRuntime } from "@/accounts/runtime";
import { flowCookie,sessionCookie,unseal,randomToken,hashToken,seal } from "@/accounts/security";
import { github } from "@/accounts/github";
import { logEvent } from "@/lib/log";
export async function GET(request:Request) {
 const runtime=await accountRuntime();
 const response=NextResponse.redirect(`${runtime.origin}/onboarding?notice=auth`);
 response.cookies.delete(flowCookie);
 response.headers.set("Cache-Control","no-store");
 const fail=(reason:string,status?:number,cause?:string)=>{logEvent("warn","github_signin_failed",{reason,...(status?{status}:{}),...(cause?{cause}:{})});response.headers.set("Location",`${runtime.origin}/onboarding?notice=auth&reason=${reason}`);return response;};
 if(!runtime.ready) return fail("setup");
 const query=new URL(request.url).searchParams;
 const flow=unseal<{state:string;verifier:string;expires:number}>((await cookies()).get(flowCookie)?.value??"",runtime.secret);
 if(query.has("error")) return fail("denied");
 if(!flow) return fail("session");
 if(flow.expires<Date.now()) return fail("expired");
 if(query.get("state")!==flow.state || !query.get("code")) return fail("state");
 let stage="exchange";
 try {
  const exchange=await fetch("https://github.com/login/oauth/access_token",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","User-Agent":"NodeDots-Code"},body:JSON.stringify({client_id:runtime.clientId,client_secret:runtime.clientSecret,code:query.get("code"),code_verifier:flow.verifier,redirect_uri:`${runtime.origin}/api/account/callback`}),cache:"no-store",signal:AbortSignal.timeout(15000)});
  const body=await exchange.json() as {access_token?:string;expires_in?:number;error?:string};
  if(!exchange.ok || !body.access_token) {
   const cause=["incorrect_client_credentials","redirect_uri_mismatch","bad_verification_code","incorrect_code_verifier"].includes(body.error??"")?body.error:"upstream_rejection";
   return fail(body.error==="incorrect_client_credentials"?"configuration":"exchange",exchange.status,cause);
  }
  stage="identity";
  const user=await github<{id:number;login:string}>(body.access_token,"/user");
  const id=randomToken(),ttl=Math.min(Math.max(body.expires_in??28800,60),28800);
  stage="storage";
  await runtime.db.batch([
   runtime.db.prepare("DELETE FROM account_sessions WHERE expires_at <= ?").bind(Date.now()),
   runtime.db.prepare("INSERT INTO account_sessions(id_hash,github_id,login,token_cipher,expires_at) VALUES(?,?,?,?,?)").bind(hashToken(id),user.id,user.login,seal(body.access_token,runtime.secret),Date.now()+ttl*1000)
  ]);
  response.headers.set("Location",`${runtime.origin}/onboarding`);
  response.cookies.set(sessionCookie,id,{httpOnly:true,secure:runtime.origin.startsWith("https:"),sameSite:"lax",path:"/",maxAge:ttl});
  logEvent("info","github_signin_completed");
 } catch(error) {return fail(stage,typeof error==="object"&&error!==null&&"status" in error&&typeof error.status==="number"?error.status:undefined);}
 return response;
}
