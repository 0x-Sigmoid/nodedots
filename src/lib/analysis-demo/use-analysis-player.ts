"use client";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnalysisPlayer, counters, formatElapsed } from "./player";

export function useAnalysisPlayer(compact = false) {
 const [player] = useState(() => new AnalysisPlayer(compact ? [0] : [0,1,2]));
 const root = useRef<HTMLDivElement>(null);
 const snapshot = useSyncExternalStore(player.subscribe,player.getSnapshot,player.getServerSnapshot);
 const hovered = useRef(false);
 const focused = useRef(false);
 useLayoutEffect(() => {
  const element = root.current;
  if (!element) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionChanged = () => player.initialize(motion.matches);
  player.initialize(motion.matches);
  const rect = element.getBoundingClientRect();
  player.setVisible(rect.bottom > 0 && rect.top < innerHeight);
  const visibility = () => player.setTabVisible(!document.hidden);
  visibility();
  document.addEventListener("visibilitychange",visibility);
  motion.addEventListener("change",motionChanged);
  const observer = new IntersectionObserver(([entry]) => {
   player.setVisible(entry.isIntersecting);
   if (!entry.isIntersecting && compact && !player.getSnapshot().reduced) player.play();
  },{threshold:.1});
  observer.observe(element);
  let frame = 0;
  let previous = performance.now();
  const elapsed = [...element.querySelectorAll<HTMLElement>("[data-analysis-elapsed]")];
  const symbols = element.querySelector<HTMLElement>("[data-analysis-symbols]");
  const relationships = element.querySelector<HTMLElement>("[data-analysis-relationships]");
  const progress = element.querySelector<HTMLElement>("[data-analysis-progress]");
  const paint = () => {
   element.style.setProperty("--analysis-scene-opacity", String(player.getOpacity()));
   const state = player.getSnapshot();
   const value = counters(state.scenario,player.getTime());
   elapsed.forEach(node => {node.textContent = value.elapsed >= state.scenario.reportAt ? "Analyzed in " + (state.scenario.reportAt/1000).toFixed(1) + "s" : formatElapsed(value.elapsed);});
   if (symbols) symbols.textContent = value.symbols.toLocaleString("en-US");
   if (relationships) relationships.textContent = value.relationships.toLocaleString("en-US");
   if (progress) progress.style.transform = "scaleX(" + value.progress + ")";
  };
  const advance = (now: number) => {
   player.tick(Math.min(100,now - previous));
   previous = now;
   paint();
   frame = requestAnimationFrame(advance);
  };
  paint();
  frame = requestAnimationFrame(advance);
  return () => {cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener("visibilitychange",visibility);motion.removeEventListener("change",motionChanged);};
 },[player,compact]);
 const updateInteraction = () => {
  const interaction = hovered.current || focused.current;
  player.setInteraction(compact ? false : interaction);
  if (!interaction && compact && player.getSnapshot().paused && !player.getSnapshot().reduced) player.play();
 };
 return {root,player,snapshot, interactionProps:{
  onPointerEnter:()=>{hovered.current=true;updateInteraction();},
  onPointerLeave:()=>{hovered.current=false;updateInteraction();if(compact&&!player.getSnapshot().reduced)player.play();},
  onFocus:()=>{focused.current=true;updateInteraction();},
  onBlur:(event: React.FocusEvent<HTMLDivElement>)=>{if (!event.currentTarget.contains(event.relatedTarget)) {focused.current=false;updateInteraction();}},
 }};
}
