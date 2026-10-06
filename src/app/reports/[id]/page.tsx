import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportViewer } from "@/components/report-viewer";
import { getDemoIds, getDemoReport, getDemoScenario } from "@/reports/demo";
import { getReportStore } from "@/db";

export const dynamicParams = true;

export function generateStaticParams() {
  return getDemoIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const stored = await getReportStore().get(id);
  if (stored) {
    return {
      title: `PR #${stored.number} — impact report`,
      description: `NodeDots Code impact report for ${stored.owner}/${stored.repo} PR #${stored.number}.`,
      alternates: { canonical: `/reports/${stored.id}` },
      robots: { index: false, follow: false },
    };
  }
  const scenario = getDemoScenario(id);
  if (!scenario) return {};
  return {
    title: `${scenario.title} — impact report`,
    description: `NodeDots Code impact report for: ${scenario.change}.`,
    alternates: { canonical: `/reports/${scenario.id}` },
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stored = await getReportStore().get(id);
  if (stored) {
    return (
      <ReportViewer
        scenarioId={stored.id}
        title={`PR #${stored.number} — ${stored.owner}/${stored.repo}`}
        change={`Head ${stored.headSha.slice(0, 12)} over base ${stored.baseSha.slice(0, 12)}`}
        description="Persisted deterministic analysis. Feedback recorded here stays local until accounts exist."
        report={stored.report}
      />
    );
  }
  const scenario = getDemoScenario(id);
  const report = await getDemoReport(id);
  if (!scenario || !report) notFound();
  return (
    <ReportViewer
      scenarioId={scenario.id}
      title={scenario.title}
      change={scenario.change}
      description={scenario.description}
      report={report}
    />
  );
}
