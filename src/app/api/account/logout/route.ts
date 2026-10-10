import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { accountRuntime } from "@/accounts/runtime";
import { sessionCookie,hashToken,validMutation } from "@/accounts/security";
export async function POST(request:Request) {
 const runtime=await accountRuntime();
 if(!validMutation(request,runtime.origin)) return new Response(null,{status:403});
 const id=(await cookies()).get(sessionCookie)?.value;
 if(id) await runtime.db.prepare("DELETE FROM account_sessions WHERE id_hash = ?").bind(hashToken(id)).run();
 const response=NextResponse.redirect(`${runtime.origin}/onboarding`,303);
 response.cookies.delete(sessionCookie);
 return response;
}
