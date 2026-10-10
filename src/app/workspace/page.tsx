import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {accountRuntime,currentSession} from "@/accounts/runtime";
import {AccountShell} from "@/components/account-shell";
import {WorkspacePicker} from "@/components/workspace-picker";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Your workspace",robots:{index:false,follow:false}};
export default async function Workspace() {
 const runtime=await accountRuntime(),session=await currentSession(runtime);
 if(!session) redirect("/onboarding");
 return <AccountShell login={session.login}><div className="account-intro"><p className="account-kicker">YOUR WORKSPACE</p><h1>Catch the work<br/>around the change.</h1><p>Connect a repository. Choose a pull request. Follow the evidence.</p></div><WorkspacePicker installUrl={`https://github.com/apps/${encodeURIComponent(runtime.slug)}/installations/new`} /></AccountShell>;
}
