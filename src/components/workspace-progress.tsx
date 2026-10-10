"use client";
import {useEffect,useState} from "react";
import {stages,stageLabels} from "@/workspace/model";
export function WorkspaceProgress({id}:{id:string}){
 const [job,setJob]=useState<{status:string;stage:string;error:string|null;title:string}|null>(null),[error,setError]=useState("");
 useEffect(()=>{const controller=new AbortController();let timer:ReturnType<typeof setTimeout>;async function poll(){try{const response=await fetch(`/api/workspace/jobs/${id}`,{cache:"no-store",signal:controller.signal});const body=await response.json();if(!response.ok)throw new Error(body.message);setJob(body);setError("");if(body.status==="completed"&&/^[a-f0-9-]{36}$/.test(body.review_id)){location.replace(`/workspace/reviews/${body.review_id}`);return;}if(body.status!=="failed")timer=setTimeout(poll,4000);}catch(e){if(!controller.signal.aborted){setError(e instanceof Error?e.message:"Could not refresh progress.");timer=setTimeout(poll,10000);}}}poll();return()=>{controller.abort();clearTimeout(timer);};},[id]);
 const index=stages.indexOf(job?.stage as typeof stages[number]);
 return <div className="ws-progress ws-panel ws-padded"><p className="ws-label">A CONNECTED REVIEW</p><h1>{job?.status==="failed"?"Let’s try that again.":"Following the change."}</h1><p>{job?.title??"Loading review progress…"}</p><ol>{stages.map((stage,i)=><li key={stage} className={i<index?"done":i===index?"active":""} aria-current={i===index?"step":undefined}><span>{i<index?"✓":i+1}</span>{stageLabels[stage]}</li>)}</ol>{job?.error&&<p role="alert" className="ws-error">{job.error}</p>}{error&&<p role="alert" className="ws-error">{error}</p>}<p>Reviews run in the background. You can leave this page and return from your inbox.</p><a className="ws-secondary" href="/workspace">Back to inbox</a></div>;
}
