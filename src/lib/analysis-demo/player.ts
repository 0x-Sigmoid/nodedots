import { scenarios } from "./scenarios";
import { stageNames, type NodePhase, type Scenario, type Stage } from "./types";

export function deriveTimeline(scenario: Scenario, time: number) {
 const events = scenario.events.filter(event => event.t <= time);
 const phases: NodePhase[] = scenario.nodes.map(() => "Queued");
 const discovered = scenario.nodes.map(() => false);
 const edges = Array<boolean>(5).fill(false);
 let stage: Stage = "Ingest";
 let lastResolved = -1;
 let announcement = "";
 let report = false;
 events.forEach(event => {
  if (event.type === "stage") { stage = event.stage; announcement = event.stage + ": " + event.text; }
  if (event.type === "discover") { discovered[event.node] = true; phases[event.node] = event.node === 0 ? "Changed" : "Queued"; }
  if (event.type === "edge") edges[event.edge] = true;
  if (event.type === "analyze") phases[event.node] = "Analyzing";
  if (event.type === "resolve") { phases[event.node] = "Resolved"; lastResolved = event.node; announcement = event.text; }
  if (event.type === "report") { stage = "Report"; report = true; announcement = event.text; }
 });
 const conflict = scenario.nodes.findIndex(node => node.state === "conflicting");
 return { events, phases, discovered, edges, stage, stageIndex: stageNames.indexOf(stage), lastResolved, report, announcement, defaultSelected: report ? (conflict >= 0 ? conflict : lastResolved) : lastResolved };
}
export function counters(scenario: Scenario, time: number) {
 return {
  symbols: Math.round(scenario.symbols * Math.max(0, Math.min(1, (time - 1400) / 1000))),
  relationships: Math.round(scenario.relationships * Math.max(0, Math.min(1, (time - 2400) / 800))),
  elapsed: Math.min(time, scenario.reportAt),
  progress: Math.min(1, time / scenario.reportAt),
 };
}
export function formatElapsed(ms: number) {
 const seconds = ms / 1000;
 return String(Math.floor(seconds / 60)).padStart(2,"0") + ":" + (seconds % 60).toFixed(1).padStart(4,"0");
}

/** A clock-independent store: tick consumes elapsed simulation milliseconds. */
export class AnalysisPlayer {
 private listeners = new Set<() => void>();
 private index = 0;
 private time = scenarios[0].reportAt;
 private speed = 1;
 private userPaused = false;
 private visible = true;
 private tabVisible = true;
 private interaction = false;
 private reduced = false;
 private selected: number | null = null;
 private signature = "";
 private snapshot = this.createSnapshot();
 private readonly serverSnapshot;

 constructor(private readonly order: number[] = [0,1,2]) {
  this.index = order[0];
  this.time = scenarios[this.index].reportAt;
  this.snapshot = this.createSnapshot();
  this.serverSnapshot = this.snapshot;
 }
 private createSnapshot() {
  const scenario = scenarios[this.index];
  const state = deriveTimeline(scenario,this.time);
  return {...state, scenario, scenarioIndex:this.index, selected:this.selected ?? state.defaultSelected, paused:this.userPaused, reduced:this.reduced, speed:this.speed};
 }
 private publish(force = false) {
  const cursor = scenarios[this.index].events.filter(event => event.t <= this.time).length;
  const signature = [this.index,cursor,this.selected,this.userPaused,this.reduced,this.speed].join(":");
  if (!force && signature === this.signature) return;
  this.signature = signature;
  this.snapshot = this.createSnapshot();
  this.listeners.forEach(listener => listener());
 }
 subscribe = (listener: () => void) => { this.listeners.add(listener); return () => {this.listeners.delete(listener);}; };
 getSnapshot = () => this.snapshot;
 getServerSnapshot = () => this.serverSnapshot;
 getTime = () => this.time;
 getOpacity = () => this.interaction || this.reduced || this.userPaused ? 1 : Math.min(1, Math.max(0, (scenarios[this.index].duration - this.time) / 220));
 initialize(reduced: boolean) { this.reduced = reduced; this.time = reduced ? scenarios[this.index].reportAt : 0; this.userPaused = reduced; this.selected = null; this.publish(true); }
 pause() { this.userPaused = true; this.publish(); }
 play() { this.userPaused = false; this.selected = null; this.publish(); }
 restart(index = this.index) { this.index = index; this.time = 0; this.selected = null; this.userPaused = false; this.publish(true); }
 setSpeed(speed: number) { if (!Number.isFinite(speed) || speed <= 0) throw Error("Speed must be positive"); this.speed = Math.min(4,Math.max(.25,speed)); this.publish(); }
 seekToEnd() { this.time = scenarios[this.index].reportAt; this.selected = null; this.publish(true); }
 select(node: number) { if (this.snapshot.phases[node] !== "Resolved") return; this.selected = node; this.userPaused = true; this.publish(); }
 setVisible(visible: boolean) { this.visible = visible; }
 setTabVisible(visible: boolean) { this.tabVisible = visible; }
 setInteraction(interaction: boolean) { this.interaction = interaction; }
 tick(delta: number) {
  if (this.userPaused || !this.visible || !this.tabVisible || delta <= 0) return;
  const scenario = scenarios[this.index];
  this.time += delta * this.speed;
  if ((this.interaction || this.reduced) && this.time >= scenario.reportAt) this.time = Math.min(this.time,scenario.duration - 1);
  else {
   while (this.time >= scenarios[this.index].duration) {
    this.time -= scenarios[this.index].duration;
    this.index = this.order[(this.order.indexOf(this.index) + 1) % this.order.length];
    this.selected = null;
   }
  }
  this.publish();
 }
}
