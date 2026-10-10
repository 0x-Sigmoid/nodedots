import type {Metadata} from "next";
import {redirect,notFound} from "next/navigation";
import {accountRuntime,currentSession} from "@/accounts/runtime";
import {WorkspaceShell} from "@/components/workspace-shell";
import {WorkspaceProgress} from "@/components/workspace-progress";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Review in progress",robots:{index:false,follow:false}};
export default async function JobPage({params}:{params:Promise<{id:string}>}){const runtime=await accountRuntime(),session=await currentSession(runtime);if(!session)redirect("/onboarding");const {id}=await params;const exists=await runtime.db.prepare("SELECT id FROM workspace_jobs WHERE id=? AND github_id=? AND expires_at>?").bind(id,session.githubId,Date.now()).first();if(!exists)notFound();return <WorkspaceShell login={session.login} active="review"><WorkspaceProgress id={id}/></WorkspaceShell>;}
