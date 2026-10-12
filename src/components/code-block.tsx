"use client";

import {useRef,useState} from "react";

export function CodeBlock({code,className="",label="Code"}:{code:string;className?:string;label?:string}) {
 const content=useRef<HTMLElement>(null);
 const [result,setResult]=useState<{code:string;status:"copied"|"error"}|null>(null);
 const status=result?.code===code?result.status:null;
 async function copy(){
  const selectedCode=code;
  try{
   await navigator.clipboard.writeText(selectedCode);
   setResult({code:selectedCode,status:"copied"});
  }catch{
   if(content.current){const range=document.createRange();range.selectNodeContents(content.current);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);}
   setResult({code:selectedCode,status:"error"});
  }
 }
 return <div className="nd-code-block">
  <div className="nd-code-toolbar"><span>{label}</span><button type="button" onClick={copy} aria-label="Copy code"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{status==="copied"?<path d="m5 12 4 4L19 6"/>:<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/></>}</svg>{status==="copied"?"Copied":"Copy"}</button></div>
  <pre className={className}><code ref={content}>{code}</code></pre>
  <span className={status==="error"?"nd-code-error":"nd-code-status"} role="status">{status==="copied"?"Code copied to clipboard.":status==="error"?"Clipboard unavailable. Select the code and use your browser’s copy shortcut.":""}</span>
 </div>;
}
