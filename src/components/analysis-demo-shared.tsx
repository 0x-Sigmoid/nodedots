"use client";
import { useEffect, useRef } from "react";
import { StateDot } from "./state-dot";
import { stageNames, stateLabels, summary, type DemoNode, type NodePhase } from "@/lib/analysis-demo/types";
import { AnalysisPlayer } from "@/lib/analysis-demo/player";

export type AnalysisSnapshot = ReturnType<AnalysisPlayer["getSnapshot"]>;
export function AnalysisRail({snapshot,compact=false}:{snapshot:AnalysisSnapshot;compact?:boolean}) {
 return <div className={"analysis-rail" + (compact ? " compact-rail" : "")}>
  <ol aria-label="Analysis stages">{stageNames.map((name,index) => {
   const status = snapshot.report || index < snapshot.stageIndex ? "done" : index === snapshot.stageIndex ? "running" : "idle";
   return <li key={name} data-status={status} aria-current={status === "running" ? "step" : undefined}><span aria-hidden="true">{status === "done" ? "✓" : String(index+1).padStart(2,"0")}</span>{name}<span className="sr-only">: {status}</span></li>;
  })}</ol>
  <span className="analysis-elapsed" data-analysis-elapsed>Analyzed in 6.6s</span>
  <div className="analysis-progress" aria-hidden="true"><i data-analysis-progress /></div>
 </div>;
}
export function AnalysisMetadata({snapshot}:{snapshot:AnalysisSnapshot}) {
 const scenario=snapshot.scenario;
 return <div className="analysis-metadata"><span>PR #{scenario.pr} · {scenario.branch} · <code>{scenario.sha}</code></span><span>{scenario.files.length} files changed +{scenario.additions} −{scenario.deletions}</span><span>Indexed <b data-analysis-symbols>{scenario.symbols.toLocaleString("en-US")}</b> symbols</span><span><b data-analysis-relationships>{scenario.relationships.toLocaleString("en-US")}</b> relationships</span></div>;
}
export function AnalysisNodeDot({node,phase}:{node:DemoNode;phase:NodePhase}) {
 return phase === "Resolved" ? <StateDot state={node.state}/> : <span className={"analysis-neutral-dot " + (phase === "Analyzing" ? "is-analyzing" : "")} aria-hidden="true"/>;
}
export function nodeCaption(node:DemoNode,phase:NodePhase) {return phase === "Resolved" ? stateLabels[node.state] : phase;}
export function AnalysisLog({snapshot}:{snapshot:AnalysisSnapshot}) {
 const log=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[snapshot.events.length,snapshot.scenarioIndex]);
 return <div className="analysis-log" ref={log} aria-label="Illustrative analysis activity">{snapshot.events.map((event,index)=><div key={index}><time>{(event.t/1000).toFixed(1).padStart(4,"0")}s</time> {event.text}</div>)}</div>;
}
export function AnalysisReport({snapshot}:{snapshot:AnalysisSnapshot}) {
 return <div className="analysis-report" data-ready={snapshot.report}>
  {snapshot.report ? <><p>{summary(snapshot.scenario.nodes)}</p><span className="detail-label">Before merging</span><ul>{snapshot.scenario.checklist.map(item=><li key={item}>{item}</li>)}</ul></> : <p>Report appears after all five components are evaluated.</p>}
 </div>;
}
export function AnalysisAnnouncement({snapshot}:{snapshot:AnalysisSnapshot}) {return <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{snapshot.announcement}</p>;}
