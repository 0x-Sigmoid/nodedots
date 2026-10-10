import type {Metadata} from "next";
import {notFound,redirect} from "next/navigation";
import {accountRuntime,currentSession} from "@/accounts/runtime";
import {authorizedRepository} from "@/accounts/github";
import {unseal} from "@/accounts/security";
import type {ImpactReport} from "@/engine/types";
import {ReportViewer} from "@/components/report-viewer";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Pull request review",robots:{index:false,follow:false}};
export default async function Review({params}:{params:Promise<{id:string}>}) {
 const runtime=await accountRuntime(),session=await currentSession(runtime);
 if(!session) redirect("/onboarding");
 const {id}=await params;
 const row=await runtime.db.prepare("SELECT * FROM workspace_reviews WHERE id = ? AND github_id = ? AND expires_at > ?").bind(id,session.githubId,Date.now()).first<{installation_id:number;repo_id:number;owner:string;repo:string;pr_number:number;head_sha:string;base_sha:string;report_cipher:string}>();
 if(!row) notFound();
 try{const repo=await authorizedRepository(session.token,row.installation_id,row.repo_id,runtime.slug);if(repo.private&&!runtime.privateRepositories)notFound();}catch{notFound();}
 const report=unseal<ImpactReport>(row.report_cipher,runtime.secret);
 if(!report) notFound();
 return <ReportViewer scenarioId={id} title={`PR #${row.pr_number} — ${row.owner}/${row.repo}`} change={`Head ${row.head_sha.slice(0,12)} over base ${row.base_sha.slice(0,12)}`} description="Analysis of commit-pinned GitHub source. Review coverage and evidence before acting. Your dispositions stay in this browser session." report={report} workspace />;
}
