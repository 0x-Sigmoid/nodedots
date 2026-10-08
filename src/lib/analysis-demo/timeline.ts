import { summary, type Scenario, type TimelineEvent } from "./types";

// A fixed seed affects parse-log timing only; required stage/finding times stay exact.
export function buildTimeline(scenario: Omit<Scenario, "events">, seed: number): TimelineEvent[] {
  let value = seed >>> 0;
  const jitter = () => { value = (1664525 * value + 1013904223) >>> 0; return value % 71; };
  const events: TimelineEvent[] = [
    { t: 0, type: "stage", stage: "Ingest", text: "PR #" + scenario.pr + " opened: " + scenario.change },
    { t: 500, type: "discover", node: 0, text: "ingest  diff fetched · " + scenario.files.length + " files changed" },
    { t: 1400, type: "stage", stage: "Parse", text: "parse  indexing imports, exports, and symbols" },
    { t: 2400, type: "stage", stage: "Graph", text: "graph  traversing component relationships" },
    { t: 2800, type: "analyze", node: 0, text: "evaluate  " + scenario.nodes[0].name },
    { t: 3200, type: "stage", stage: "Evaluate", text: "evaluate  checking evidence against the change" },
  ];
  for (let node = 1; node < 5; node++) events.push({
    t: 1450 + node * 155 + jitter(), type: "discover", node,
    text: "parse  " + scenario.nodes[node].path.split(":")[0] + " · " + (node + 2) + " imports, 2 exports",
  });
  for (let edge = 0; edge < 5; edge++) events.push({
    t: 2400 + edge * 140, type: "edge", edge, text: "graph  connection " + (edge + 1) + " established",
  });
  const resolves = [3200, 3800, 4400, 5200, 6000];
  resolves.forEach((t, node) => {
    if (node > 0) events.push({t: t - 450, type: "analyze", node, text: "evaluate  " + scenario.nodes[node].name});
    events.push({t, type: "resolve", node, text: scenario.nodes[node].name + " · " + scenario.nodes[node].state});
  });
  events.push({t: scenario.reportAt, type: "report", text: "report  " + summary(scenario.nodes)});
  return events.sort((a,b) => a.t - b.t);
}
