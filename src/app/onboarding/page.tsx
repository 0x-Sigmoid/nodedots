import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {accountRuntime,currentSession} from "@/accounts/runtime";
import {installations} from "@/accounts/github";
import {AccountShell} from "@/components/account-shell";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Get started",robots:{index:false,follow:false}};
export default async function Onboarding({searchParams}:{searchParams:Promise<{notice?:string}>}) {
 const runtime=await accountRuntime(),session=await currentSession(runtime),{notice}=await searchParams;
 let connected=false,accessError=false;
 if(session) {try{connected=(await installations(session.token,runtime.slug)).length>0;}catch{accessError=true;}}
 if(connected) redirect("/workspace");
 return <AccountShell login={session?.login}><div className="account-intro"><p className="account-kicker">NODEDOTS CODE · EARLY BETA</p><h1>Connect your code.<br/>See what changes.</h1><p>Sign in with GitHub, choose your repositories, and review your first pull request.</p></div>
  <ol className="account-steps" aria-label="Getting started"><li aria-current={!session?"step":undefined}><span>01</span>Sign in</li><li aria-current={session?"step":undefined}><span>02</span>Connect GitHub</li><li><span>03</span>First review</li></ol>
  <section className="account-card"><p className="account-kicker">{session?"STEP 02":"STEP 01"}</p><h2>{session?"Choose what NodeDots can see.":"Your GitHub. Your workspace."}</h2><p>{session?"Install the NodeDots GitHub App on your account or organization. Select the repositories you want to connect, then return here.":"Use your GitHub account to create your NodeDots workspace. No new password to remember."}</p>
   {notice==="auth"&&<p className="account-error" role="alert">GitHub sign-in wasn&apos;t completed. Please try again.</p>}
   {!runtime.ready?<div className="account-empty"><h3>GitHub connection is being set up</h3><p>Account creation will open once the NodeDots GitHub App is configured. You can explore the product example in the meantime.</p><a className="clarity-docs-button" href="/#preview">Explore a Review</a></div>:accessError?<><p role="alert">Your GitHub authorization needs to be renewed.</p><a className="clarity-start-button" href="/api/account/start">Sign in Again</a></>:<a className="clarity-start-button" href={session?`https://github.com/apps/${encodeURIComponent(runtime.slug)}/installations/new`:"/api/account/start"}>{session?"Connect GitHub":"Continue with GitHub"}</a>}
   {session&&runtime.ready&&!accessError&&<a className="account-text-link" href="/workspace">I&apos;ve installed NodeDots →</a>}
   <ul className="account-permissions"><li>Read repository contents and pull requests.</li><li>Publish advisory GitHub checks when automated reviews are enabled.</li><li>No code, workflow, or deployment write access.</li></ul><p className="account-note">You control which repositories are connected and can revoke access on GitHub.</p>
  </section></AccountShell>;
}
