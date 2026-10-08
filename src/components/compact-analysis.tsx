"use client";
import { StateDot } from "./state-dot";
import { useAnalysisPlayer } from "@/lib/analysis-demo/use-analysis-player";
import { stateLabels } from "@/lib/analysis-demo/types";
import { AnalysisRail, AnalysisMetadata, AnalysisNodeDot, AnalysisAnnouncement, AnalysisReport, nodeCaption } from "./analysis-demo-shared";

export function CompactAnalysis() {
 const {root,player,snapshot,interactionProps}=useAnalysisPlayer(true);
 const finding=snapshot.selected>=0?snapshot.scenario.nodes[snapshot.selected]:null;
 const titles=["Login uses the new identity provider.","Protected routes follow the new identity.","The user record has been updated.","New identity. Old billing assumption.","The signed-out redirect has no test."];
 return <div className="wl-review analysis-compact" ref={root} {...interactionProps} data-scenario="auth">
  <AnalysisRail snapshot={snapshot} compact/>
  <div className="wl-map">
   <div className="wl-map-top"><span className="wl-example-badge">Illustrative example</span><span>Firebase → Clerk</span></div>
   <AnalysisMetadata snapshot={snapshot}/>
   <div className="wl-chain" role="group" aria-label="Five connected components, evaluated from Login through Tests">
    {snapshot.scenario.nodes.map((node,index)=><button key={node.name} className={"wl-node "+(snapshot.phases[index]==="Analyzing"?"is-analyzing ":"")+(snapshot.phases[index]==="Resolved"&&node.state==="conflicting"?"analysis-conflict":"")} type="button" aria-pressed={snapshot.selected===index} aria-disabled={!snapshot.report} aria-controls="wl-finding" onClick={()=>{if(snapshot.report)player.select(index);}}>
     <span className="wl-node-dot"><AnalysisNodeDot node={node} phase={snapshot.phases[index]}/></span><span>{index===2?"Identity":node.name}</span><span className="wl-node-status">{nodeCaption(node,snapshot.phases[index])}</span>
    </button>)}
   </div>
   <div className="wl-map-bottom"><span>One change. Five connected components.</span><span data-analysis-elapsed>Analyzed in 6.6s</span></div>
  </div>
  <div className="wl-finding" id="wl-finding">
   {finding?<><p className="wl-finding-state"><StateDot state={finding.state}/>{stateLabels[finding.state]}</p><h3>{titles[snapshot.selected]}</h3><p className="wl-finding-detail">{finding.why}</p><code>{finding.path}</code><pre className="analysis-snippet">{finding.snippet}</pre><div className="wl-next-step"><span>Next step</span><p>{finding.next}</p></div></>:<div className="analysis-stage-copy"><p className="wl-finding-state">{snapshot.stage} in progress</p><h3>{snapshot.scenario.change}</h3><p className="wl-finding-detail">{snapshot.stage==="Ingest"?"Fetching PR #184 and its 14 changed files.":snapshot.stage==="Parse"?"Indexing symbols, imports, and exports across the repository.":"Building the connected view before checking each component."}</p><code>auth/clerk · 9f3c2ab</code></div>}
   <AnalysisReport snapshot={snapshot}/>
   <button className="analysis-compact-play" type="button" aria-label={snapshot.paused?"Play analysis":"Pause analysis"} onClick={()=>{if(snapshot.paused){if(snapshot.reduced)player.restart();else player.play();}else player.pause();}}>{snapshot.paused?"▶︎ Play":"Ⅱ Pause"}</button>
  </div>
  <AnalysisAnnouncement snapshot={snapshot}/>
 </div>;
}
