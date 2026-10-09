import type { NavIcon as IconName } from "@/config/nav";
const paths: Record<IconName, string> = {
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18",
  report: "M5 3h10l4 4v14H5ZM15 3v5h4M8 12h8M8 16h5",
  check: "m4 12 5 5L20 6", terminal: "m4 6 6 6-6 6m9 0h7", memory: "M4 5h7v14H4ZM13 5h7v14h-7M7 9h1m8 0h1M7 13h1m8 0h1",
  test: "M9 3h6m-5 0v6L4 19v2h16v-2L14 9V3M8 15h8", auth: "M8 11V7a4 4 0 0 1 8 0v4M5 11h14v10H5Z",
  database: "M4 6c0-4 16-4 16 0s-16 4-16 0v12c0 4 16 4 16 0V6M4 12c0 4 16 4 16 0",
  api: "M8 4H4v16h4M16 4h4v16h-4M9 12h6", graph: "M4 12h6l4-7h6M10 12l4 7h6",
  book: "M3 4h8v16H3ZM13 4h8v16h-8", roadmap: "M3 5h6l6 14h6M9 5l6 14M15 5h6M3 19h6",
  history: "M4 5v5h5M4 10a8 8 0 1 1 0 5m8-9v6l4 2", article: "M4 3h16v18H4ZM8 7h8M8 11h8M8 15h5",
  question: "M9 8a3 3 0 1 1 4 3c-1 1-1 2-1 3m0 3v1", shield: "M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7ZM8 12l3 3 5-6",
  contact: "M3 5h18v14H3ZM3 5l9 7 9-7", info: "M12 10v8m0-12v1", price: "M4 3h8l9 9-9 9-9-9V3ZM7 7h1",
  x: "M4 3h4l12 18h-4ZM20 3 4 21",
};
export function NavIcon({ name }: { name: IconName }) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>; }
