import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {accountRuntime,currentSession} from "@/accounts/runtime";
import {WorkspaceShell} from "@/components/workspace-shell";
import {WorkspacePicker} from "@/components/workspace-picker";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Your workspace",robots:{index:false,follow:false}};
export default async function Workspace() {
 const runtime=await accountRuntime(),session=await currentSession(runtime);
 if(!session) redirect("/onboarding");
 return <WorkspaceShell login={session.login}><WorkspacePicker installUrl={`https://github.com/apps/${encodeURIComponent(runtime.slug)}/installations/new`} /></WorkspaceShell>;
}
