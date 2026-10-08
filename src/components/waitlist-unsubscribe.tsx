"use client";
import { useState } from "react";
import { Mark, ThemeToggle } from "./site-header";

export function WaitlistUnsubscribe({ token }: { token: string | null }) {
 const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
 async function unsubscribe() {
  setStatus("saving");
  try {
   const response = await fetch(`/api/waitlist/unsubscribe?token=${encodeURIComponent(token || "")}`, { method: "POST" });
   if (!response.ok) throw new Error("Unavailable");
   setStatus("done");
  } catch { setStatus("error"); }
 }
 return <div className="wl-page">
  <div className="wl-glow" aria-hidden="true" />
  <header className="wl-header wl-width"><a className="brand" href="/waitlist"><Mark /><span>NodeDots</span></a><ThemeToggle /></header>
  <main className="wl-hero wl-width">
   <p className="wl-eyebrow">Your email preferences</p>
   <h1 style={{fontSize:"clamp(2rem, 6vw, 4rem)"}}>{status === "done" ? "You're unsubscribed." : token ? "Leave the waitlist?" : "This link isn't valid."}</h1>
   <p className="wl-lead">{status === "done" ? "You won't receive NodeDots waitlist updates. You're always welcome back." : token ? "Unsubscribe to remove your email from NodeDots early-access and launch updates." : "Use the unsubscribe link in your NodeDots confirmation email."}</p>
   {token && status !== "done" && <button className="button" disabled={status === "saving"} onClick={()=>void unsubscribe()}>{status === "saving" ? "Unsubscribing…" : "Unsubscribe"}</button>}
   {status === "error" && <p role="alert">We couldn&apos;t update your preference. Please try again.</p>}
   {status === "done" && <p role="status">Your email has been removed.</p>}
   <p style={{marginTop:24}}><a className="text-button" href="/waitlist">Back to NodeDots</a></p>
  </main>
 </div>;
}
