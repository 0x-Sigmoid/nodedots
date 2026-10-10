import { NextResponse } from "next/server";
import { accountRuntime } from "@/accounts/runtime";
import { flowCookie, randomToken, pkceChallenge, seal } from "@/accounts/security";
export async function GET(request:Request) {
 const runtime = await accountRuntime();
 if(new URL(request.url).origin!==runtime.origin) return NextResponse.redirect(`${runtime.origin}/api/account/start`);
 if(!runtime.ready) return NextResponse.redirect(`${runtime.origin}/onboarding?notice=setup`);
 const state=randomToken(),verifier=randomToken();
 const target=new URL("https://github.com/login/oauth/authorize");
 target.search=new URLSearchParams({client_id:runtime.clientId,redirect_uri:`${runtime.origin}/api/account/callback`,state,code_challenge:pkceChallenge(verifier),code_challenge_method:"S256"}).toString();
 const response=NextResponse.redirect(target);
 response.cookies.set(flowCookie,seal({state,verifier,expires:Date.now()+600000},runtime.secret),{httpOnly:true,secure:runtime.origin.startsWith("https:"),sameSite:"lax",path:"/",maxAge:600});
 response.headers.set("Cache-Control","no-store");
 return response;
}
