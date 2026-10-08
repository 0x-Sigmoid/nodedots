"use client";

import { useEffect, useRef, useState } from "react";
import { StateDot } from "./state-dot";

/**
 * Shared early-access signup form. Used by the marketing hero and the
 * dedicated /waitlist page with identical logic: same /api/waitlist
 * contract, same honeypot, same privacy dialog.
 */
export function WaitlistForm({ idPrefix = "wl" }: { idPrefix?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const privacyDialog = useRef<HTMLDialogElement>(null);

  const emailId = `${idPrefix}-email`;
  const websiteId = `${idPrefix}-website`;

  useEffect(() => {
    if (privacy) privacyDialog.current?.showModal();
    else privacyDialog.current?.close();
  }, [privacy]);

  async function join(value: string, website = "") {
    const clean = value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || clean.length > 254) {
      throw new Error("Enter a valid email address.");
    }
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, consent: true, website }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(body.message || "We couldn't save your email. Please try again.");
      setStatus("success");
      setMessage("You're on the list. We'll be in touch when early access opens.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again in a moment.");
    }
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void join(email, String(form.get("website") || "")).catch(() => {
            setStatus("error");
            setMessage("Enter a valid email address.");
          });
        }}
      >
        <label className="sr-only" htmlFor={emailId}>
          Your email address
        </label>
        <div className="signup-row">
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="Your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "saving" || status === "success"}
            aria-invalid={status === "error"}
            aria-describedby={`${idPrefix}-notice ${idPrefix}-result`}
          />
          <button className="button" disabled={status === "saving" || status === "success"} type="submit">
            <StateDot state="action" />
            {status === "saving" ? "Joining…" : status === "success" ? "You're on the list" : "Join the waitlist"}
          </button>
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor={websiteId}>Website</label>
          <input id={websiteId} name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <p id={`${idPrefix}-result`} className={`form-message ${status === "error" ? "error" : ""}`} role="status">
          {message && (
            <>
              <StateDot state={status === "error" ? "conflicting" : "confirmed"} />
              {message}
            </>
          )}
        </p>
        <p id={`${idPrefix}-notice`} className="signup-notice">
          Early-access and launch updates. Unsubscribe anytime.
          {" "}
          By joining, you agree to receive these updates.{" "}
          <button type="button" className="text-button" onClick={() => setPrivacy(true)}>
            Privacy
          </button>
        </p>
      </form>

          <dialog ref={privacyDialog} className="privacy-dialog" aria-labelledby={`${idPrefix}-privacy-title`} onClose={() => setPrivacy(false)}>
            <h2 id={`${idPrefix}-privacy-title`}>Waitlist privacy</h2>
            <p>
              We collect your email address and the time you join so we can send NodeDots early-access
              invitations and launch updates. We store signups privately and do not publish or sell your
              email address.
            </p>
            <p>
              We use short-lived, hashed request identifiers to limit automated abuse. This page does not
              connect to your repositories or process your code.
            </p>
            <p>
              Joining is optional. Each update will include an unsubscribe option. We will review and
              remove waitlist data when the early-access campaign ends.
            </p>
            <button className="button" onClick={() => setPrivacy(false)} type="button">
              Got it
            </button>
          </dialog>
    </>
  );
}
