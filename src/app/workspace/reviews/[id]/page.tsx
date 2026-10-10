import type {Metadata} from "next";
import {notFound,redirect} from "next/navigation";
import {AccountError,github} from "@/accounts/github";
import {unseal} from "@/accounts/security";
import type {ImpactReport} from "@/engine/types";
import {reviewAccess} from "@/workspace/access";
import {comparison} from "@/workspace/model";
import {WorkspaceShell} from "@/components/workspace-shell";
import {WorkspaceReview} from "@/components/workspace-review";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Pull request review",robots:{index:false,follow:false}};
export default async function Review({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 let access;try{access=await reviewAccess(id);}catch(error){if(error instanceof AccountError&&error.status===401)redirect("/onboarding");notFound();}
 const {runtime,session,row,report}=access;
 const previous=await runtime.db.prepare("SELECT report_cipher FROM workspace_reviews WHERE github_id=? AND repo_id=? AND pr_number=? AND head_sha<>? AND created_at<? AND expires_at>? ORDER BY created_at DESC LIMIT 1").bind(session.githubId,row.repo_id,row.pr_number,row.head_sha,row.created_at,Date.now()).first<{report_cipher:string}>();
 const before=previous?unseal<ImpactReport>(previous.report_cipher,runtime.secret):null;
 let stale=false;try{const pr=await github<{head:{sha:string}}>(session.token,`/repos/${row.owner}/${row.repo}/pulls/${row.pr_number}`);stale=pr.head.sha!==row.head_sha;}catch{/* The report remains pinned and accessible through verified repository access. */}
 return <WorkspaceShell login={session.login} active="review"><WorkspaceReview id={id} report={report} repository={`${row.owner}/${row.repo}`} pull={row.pr_number} head={row.head_sha} base={row.base_sha} installation={row.installation_id} repoId={row.repo_id} stale={stale} compare={before?comparison(report,before):null}/></WorkspaceShell>;
}
