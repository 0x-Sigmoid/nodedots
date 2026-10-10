"use client";
import {useEffect,useState} from "react";
type Install={id:number;account:{login:string}};
type Repo={id:number;full_name:string;private:boolean};
type Pull={number:number;title:string};
export function WorkspacePicker({installUrl}:{installUrl:string}) {
 const [installs,setInstalls]=useState<Install[]>([]),[repos,setRepos]=useState<Repo[]>([]),[pulls,setPulls]=useState<Pull[]>([]);
 const [installation,setInstallation]=useState(""),[repository,setRepository]=useState(""),[pull,setPull]=useState("");
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{
  const controller=new AbortController();
  const query=new URLSearchParams();
  if(installation) query.set("installation",installation);
  if(repository) query.set("repository",repository);
  setLoading(true);setError("");
  fetch(`/api/workspace?${query}`,{signal:controller.signal,cache:"no-store"}).then(async response=>{
   const body=await response.json();
   if(!response.ok) throw new Error(body.message);
   if(repository) setPulls(body.pulls);
   else if(installation) setRepos(body.repositories);
   else setInstalls(body.installations);
  }).catch(error=>{if(!controller.signal.aborted)setError(error instanceof Error?error.message:"Couldn't load GitHub.");}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[installation,repository]);
 async function review() {
  setBusy(true);setError("");
  try {
   const response=await fetch("/api/workspace/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({installation:Number(installation),repository:Number(repository),pull:Number(pull)})});
   const body=await response.json();
   if(!response.ok) throw new Error(body.message);
   if(typeof body.href!=="string" || !/^\/workspace\/reviews\/[a-f0-9-]+$/.test(body.href)) throw new Error("Unexpected review response.");
   window.location.assign(body.href);
  } catch(error) {setError(error instanceof Error?error.message:"Couldn't start the review.");setBusy(false);}
 }
 return <div className="account-card">
  <p className="account-kicker">YOUR FIRST REVIEW</p><h2>Start with one pull request.</h2><p>Choose a connected repository. NodeDots checks the change and builds an evidence-backed impact report.</p>
  {!loading && !installs.length && !installation && <div className="account-empty"><h3>Connect your GitHub repositories</h3><p>Install NodeDots on your account or organization, then choose only the repositories you want to review.</p><a className="clarity-start-button" href={installUrl}>Connect GitHub</a></div>}
  {!!installs.length && <div className="account-fields">
   <label>GitHub account<select value={installation} disabled={busy} onChange={e=>{setInstallation(e.target.value);setRepository("");setPull("");setRepos([]);setPulls([]);}}><option value="">Choose an account</option>{installs.map(item=><option value={item.id} key={item.id}>{item.account.login}</option>)}</select></label>
   {installation && <label>Repository<select value={repository} disabled={loading||busy} onChange={e=>{setRepository(e.target.value);setPull("");setPulls([]);}}><option value="">Choose a repository</option>{repos.map(repo=><option value={repo.id} key={repo.id}>{repo.full_name}{repo.private?" · Private":""}</option>)}</select></label>}
   {installation&&!repository&&!loading&&!repos.length&&!error&&<p>No eligible repositories found. Connect a public repository for the first beta review.</p>}
   {repository && <label>Open pull request<select value={pull} disabled={loading||busy} onChange={e=>setPull(e.target.value)}><option value="">Choose a pull request</option>{pulls.map(pr=><option value={pr.number} key={pr.number}>#{pr.number} · {pr.title}</option>)}</select></label>}
   {repository&&!loading&&!pulls.length&&!error && <p>No open pull requests yet. Open one on GitHub, then refresh this page.</p>}
   <button className="clarity-start-button" type="button" disabled={!pull||loading||busy} onClick={review}>{busy?"Reviewing your change…":"Review Pull Request"}</button>
   <a className="account-text-link" href={installUrl}>Manage connected repositories</a>
  </div>}
  {loading&&<p role="status">Loading GitHub…</p>}{busy&&<p role="status">Reading the pinned commits and checking connected code. Keep this page open.</p>}
  {error&&<p className="account-error" role="alert">{error} <a href="/api/account/start">Sign in again</a> or <a href="/workspace">reload the workspace</a>.</p>}
  <p className="account-note">Beta · Supports JavaScript and TypeScript. Coverage limits are included in every report. Reviews are advisory; keep your tests and human review.</p>
 </div>;
}
