"use client";
import { Mark } from "./site-header";
import { StateDot } from "./state-dot";
import { useAnalysisPlayer } from "@/lib/analysis-demo/use-analysis-player";
import { scenarios } from "@/lib/analysis-demo/scenarios";
import { stateLabels } from "@/lib/analysis-demo/types";
import { scenarioCaptions } from "@/lib/marketing-copy";
import { AnalysisRail, AnalysisMetadata, AnalysisLog, AnalysisReport, AnalysisNodeDot, AnalysisAnnouncement, nodeCaption } from "./analysis-demo-shared";

const edges = [
 "M90 150C190 150 190 72 300 72", "M90 150C190 150 190 228 300 228",
 "M300 72H510", "M300 228C405 228 400 72 510 72", "M300 228H510",
];
export function InteractiveDemo({sectionId="preview",title="See the change in context.",concept="Interactive concept"}:{sectionId?:string;title?:string;concept?:string}) {
 const {root,player,snapshot,interactionProps}=useAnalysisPlayer();
 const {scenario,scenarioIndex:selectedScenario,selected}=snapshot;
 const finding=selected >= 0 ? scenario.nodes[selected] : null;
 const activeFinding=finding && snapshot.phases[selected] === "Resolved";
 function switchScenario(index:number) {player.restart(index);}
 return <section className="preview-section" id={sectionId} aria-labelledby={sectionId+"-title"}>
  <div className="section-heading"><h2 id={sectionId+"-title"}>{title}</h2><span className="concept-label">{concept}</span></div>
  <p className="scenario-caption">{scenarioCaptions[scenario.id]}</p>
  <div className="workspace analysis-workspace" ref={root} {...interactionProps} data-reveal data-scenario={scenario.id}>
   <div className="workspace-bar"><span className="workspace-name"><Mark/> Change review</span><span className="workspace-meta">Illustrative example · GitHub pull requests</span></div>
   <div className="analysis-toolbar">
    <div className="scenario-tabs" role="tablist" aria-label="Example pull request">
     {scenarios.map((item,index)=><button key={item.id} type="button" role="tab" id={sectionId+"-tab-"+index} aria-controls={sectionId+"-panel"} aria-selected={index===selectedScenario} tabIndex={index===selectedScenario?0:-1} data-state={index===selectedScenario?"active":"inactive"} onClick={()=>switchScenario(index)} onKeyDown={event=>{
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      event.preventDefault();
      const next=event.key==="Home"?0:event.key==="End"?2:(index+(event.key==="ArrowRight"?1:-1)+3)%3;
      switchScenario(next);document.getElementById(sectionId+"-tab-"+next)?.focus();
     }}>{item.label}</button>)}
    </div>
    <div className="analysis-controls">
     <button type="button" aria-label={snapshot.paused?"Play analysis":"Pause analysis"} onClick={()=>{if(snapshot.paused){if(snapshot.reduced&&snapshot.report)player.restart();else player.play();}else player.pause();}}>{snapshot.paused?"▶︎":"Ⅱ"}</button>
     <button type="button" aria-label="Restart analysis" onClick={()=>player.restart()}>↻</button>
     <button type="button" onClick={()=>player.seekToEnd()}>Skip to result</button>
     <label className="sr-only" htmlFor={sectionId+"-speed"}>Analysis speed</label><select id={sectionId+"-speed"} value={snapshot.speed} onChange={event=>player.setSpeed(Number(event.target.value))} aria-label="Analysis speed"><option value={.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
    </div>
   </div>
   <AnalysisRail snapshot={snapshot}/>
   <AnalysisMetadata snapshot={snapshot}/>
   <div role="tabpanel" id={sectionId+"-panel"} aria-labelledby={sectionId+"-tab-"+selectedScenario} className="analysis-scene" key={scenario.id}>
    <div className="workspace-body">
     <div className="system-map">
      <div className="map-heading"><span>{scenario.change}</span><span>{snapshot.report?"Select a component":snapshot.stage+" in progress"}</span></div>
      <div className="graph-nodes" role="group" aria-label={scenario.label+": five connected components. Components are evaluated in discovery order."}>
       <svg className="map-lines" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">{edges.map((edge,index)=><path key={index} d={edge} pathLength="1" className={"analysis-edge "+(snapshot.edges[index]?"is-drawn":"")}/>)}</svg>
       {scenario.nodes.map((node,index)=><div className={"node-position analysis-node-position "+(snapshot.discovered[index]?"is-discovered":"")} key={node.name}>
        <button className={"graph-node "+(snapshot.phases[index]==="Analyzing"?"is-analyzing ":"")+(index===selected&&activeFinding?"selected state-"+node.state:"")+(snapshot.phases[index]==="Resolved"&&node.state==="conflicting"?" analysis-conflict":"")} type="button" onClick={()=>player.select(index)} aria-pressed={index===selected} aria-disabled={snapshot.phases[index]!=="Resolved"} title={snapshot.phases[index]==="Resolved"?"Show finding":"Awaiting analysis"}>
         <AnalysisNodeDot node={node} phase={snapshot.phases[index]}/><span>{node.name}</span><small>{nodeCaption(node,snapshot.phases[index])}</small>
        </button>
       </div>)}
      </div>
      <p className="sr-only">{scenario.nodes.map((node,index)=>node.name+": "+nodeCaption(node,snapshot.phases[index])).join(". ")}</p>
      <p className="map-note">One pull request. The connected repo.</p>
      <AnalysisLog snapshot={snapshot}/>
      <details className="analysis-files"><summary>{scenario.files.length} changed files</summary><ul>{scenario.files.map(path=><li key={path}><code>{path}</code></li>)}</ul></details>
     </div>
     <aside className="finding analysis-finding" aria-label="Selected component finding">
      {activeFinding&&finding?<><span className={"finding-state state-"+finding.state}><StateDot state={finding.state}/>{stateLabels[finding.state]}</span><span className="finding-component">{finding.name}</span><h3>{finding.title}</h3><p>{finding.why}</p><div className="evidence"><span className="detail-label">Evidence</span><code>{finding.path}</code><p>{finding.evidence}</p><pre>{finding.snippet}</pre></div><div className="finding-action"><span className="detail-label">Suggested next step</span><p>{finding.next}</p></div></>:<div className="analysis-stage-copy"><span className="detail-label">{snapshot.stage}</span><h3>{scenario.change}</h3><p>{snapshot.stage==="Ingest"?"Fetching the pull request diff and identifying changed files.":snapshot.stage==="Parse"?"Indexing symbols, imports, and exports across the repository.":"Following connections from the changed code into the rest of the system."}</p></div>}
      <AnalysisReport snapshot={snapshot}/>
      <span className="finding-disclaimer">Illustrative finding · Product in development</span>
     </aside>
    </div>
   </div>
   <AnalysisAnnouncement snapshot={snapshot}/>
  </div>
 </section>;
}
