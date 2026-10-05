import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportViewer } from "@/components/report-viewer";
import { getDemoIds, getDemoReport, getDemoScenario } from "@/reports/demo";

export function generateStaticParams() {
  return getDemoIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
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
  const scenario = getDemoScenario(id);
  const report = getDemoReport(id);
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
