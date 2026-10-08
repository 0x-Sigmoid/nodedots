import type { DotState } from "@/components/state-dot";

export const stageNames = ["Ingest", "Parse", "Graph", "Evaluate", "Report"] as const;
export type Stage = typeof stageNames[number];
export type NodePhase = "Queued" | "Changed" | "Analyzing" | "Resolved";
export type DemoNode = { name: string; state: DotState; title: string; why: string; path: string; evidence: string; snippet: string; next: string };
export type TimelineEvent =
  | { t: number; type: "stage"; stage: Stage; text: string }
  | { t: number; type: "discover"; node: number; text: string }
  | { t: number; type: "edge"; edge: number; text: string }
  | { t: number; type: "analyze" | "resolve"; node: number; text: string }
  | { t: number; type: "report"; text: string };
export type Scenario = {
  id: string; label: string; change: string; pr: number; branch: string; sha: string;
  additions: number; deletions: number; files: string[]; symbols: number; relationships: number;
  nodes: DemoNode[]; checklist: string[]; events: TimelineEvent[]; reportAt: number; duration: number;
};
export const stateLabels: Record<DotState, string> = {
  confirmed: "Confirmed", missing: "Missing", conflicting: "Conflicting", uncertain: "Uncertain", action: "Action required",
};
export function summary(nodes: DemoNode[]) {
  return (["confirmed", "conflicting", "missing", "uncertain", "action"] as DotState[])
    .map(state => ({state, count: nodes.filter(node => node.state === state).length}))
    .filter(item => item.count)
    .map(({state,count}) => count + " " + (state === "action" ? "action required" : state)).join(", ");
}
