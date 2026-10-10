import {timingSafeEqual} from "node:crypto";
import {accountRuntime} from "@/accounts/runtime";
import {executeJob} from "@/workspace/jobs";
import {readInput,privateHeaders} from "@/workspace/access";
export async function POST(request:Request){const runtime=await accountRuntime();const value=request.headers.get("authorization")?.replace(/^Bearer /,"")??"";if(!runtime.runnerSecret||Buffer.byteLength(value)!==Buffer.byteLength(runtime.runnerSecret)||!timingSafeEqual(Buffer.from(value),Buffer.from(runtime.runnerSecret)))return Response.json({message:"Unauthorized"},{status:401,headers:privateHeaders});const input=await readInput(request);if(typeof input.id!=="string"||!/^[a-f0-9-]{36}$/.test(input.id))return Response.json({message:"Invalid job"},{status:400});const result=await executeJob(runtime,input.id);return Response.json({status:result},{status:result==="busy"?409:200,headers:privateHeaders});}
