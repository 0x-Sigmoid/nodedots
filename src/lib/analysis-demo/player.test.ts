import { describe, it, expect } from "vitest";
import { AnalysisPlayer, deriveTimeline, counters } from "./player";
import { buildTimeline } from "./timeline";
import { scenarios } from "./scenarios";
describe("illustrative analysis timeline",()=>{
 it("has deterministic seeded discovery and ordered events",()=>{
  const scenario=scenarios[0];
  expect(buildTimeline(scenario,184)).toEqual(scenario.events);
  expect(buildTimeline(scenario,184)).toEqual(buildTimeline(scenario,184));
  expect(buildTimeline(scenario,185)).not.toEqual(scenario.events);
  expect(scenario.events.map(event=>event.t)).toEqual([...scenario.events].map(event=>event.t).sort((a,b)=>a-b));
 });
 it("resolves components individually at the required timestamps",()=>{
  expect(scenarios[0].events.filter(event=>event.type==="resolve").map(event=>event.t)).toEqual([3200,3800,4400,5200,6000]);
  expect(deriveTimeline(scenarios[0],5199).phases[3]).toBe("Analyzing");
  expect(deriveTimeline(scenarios[0],5200).phases[3]).toBe("Resolved");
  expect(deriveTimeline(scenarios[0],6600).report).toBe(true);
 });
 it("starts with queued nodes and ends focused on the Billing conflict",()=>{
  expect(deriveTimeline(scenarios[0],0).phases).toEqual(Array(5).fill("Queued"));
  expect(deriveTimeline(scenarios[0],6600).defaultSelected).toBe(3);
  expect(counters(scenarios[0],6600)).toEqual({symbols:1284,relationships:3906,elapsed:6600,progress:1});
 });
 it("pauses and resumes without changing elapsed simulation time",()=>{
  const player=new AnalysisPlayer();player.initialize(false);player.tick(1000);player.pause();player.tick(5000);
  expect(player.getTime()).toBe(1000);player.play();player.tick(400);expect(player.getTime()).toBe(1400);
 });
 it("pauses while offscreen or the tab is hidden",()=>{
  const player=new AnalysisPlayer();player.initialize(false);player.setVisible(false);player.tick(500);expect(player.getTime()).toBe(0);
  player.setVisible(true);player.setTabVisible(false);player.tick(500);expect(player.getTime()).toBe(0);
  player.setTabVisible(true);player.tick(500);expect(player.getTime()).toBe(500);
 });
 it("holds the completed report for six seconds then switches scenarios",()=>{
  const player=new AnalysisPlayer();player.initialize(false);player.tick(6600);expect(player.getSnapshot().report).toBe(true);
  player.tick(5999);expect(player.getSnapshot().scenarioIndex).toBe(0);
  player.tick(1);expect(player.getSnapshot().scenarioIndex).toBe(1);expect(player.getTime()).toBe(0);
  player.tick(25200);expect(player.getSnapshot().scenarioIndex).toBe(0);
 });
 it("loops the compact example without changing scenarios",()=>{
  const player=new AnalysisPlayer([0]);player.initialize(false);player.tick(12600);
  expect(player.getSnapshot().scenarioIndex).toBe(0);expect(player.getTime()).toBe(0);
 });
 it("restarts immediately on a scenario switch, speed and seek work",()=>{
  const player=new AnalysisPlayer();player.initialize(false);player.tick(4000);player.restart(2);
  expect(player.getSnapshot().scenarioIndex).toBe(2);expect(player.getTime()).toBe(0);
  player.setSpeed(2);player.tick(1000);expect(player.getTime()).toBe(2000);
  player.seekToEnd();expect(player.getSnapshot().report).toBe(true);
 });
 it("reduced motion starts in the complete final state",()=>{
  const player=new AnalysisPlayer();player.initialize(true);
  expect(player.getSnapshot().report).toBe(true);expect(player.getSnapshot().paused).toBe(true);
  expect(player.getSnapshot().phases).toEqual(Array(5).fill("Resolved"));
  player.tick(20000);expect(player.getTime()).toBe(6600);
 });
 it("interaction holds auto-advance and selection stops playback",()=>{
  const player=new AnalysisPlayer();player.initialize(false);player.setInteraction(true);player.tick(13000);
  expect(player.getSnapshot().scenarioIndex).toBe(0);
  player.select(1);expect(player.getSnapshot().selected).toBe(1);expect(player.getSnapshot().paused).toBe(true);
  player.setInteraction(false);player.play();player.tick(1);expect(player.getSnapshot().scenarioIndex).toBe(1);
 });
 it("publishes events rather than every animation frame",()=>{
  const player=new AnalysisPlayer();player.initialize(false);let notifications=0;player.subscribe(()=>notifications++);
  for(let frame=0;frame<20;frame++)player.tick(10);
  expect(notifications).toBeLessThanOrEqual(1);
 });
});
