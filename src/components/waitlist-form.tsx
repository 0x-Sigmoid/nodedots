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
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState<string>();
  const privacyDialog = useRef<HTMLDialogElement>(null);
  const confirmationDialog = useRef<HTMLDialogElement>(null);
  const confirmationButton = useRef<HTMLButtonElement>(null);
  const signupButton = useRef<HTMLButtonElement>(null);

  const emailId = `${idPrefix}-email`;
  const websiteId = `${idPrefix}-website`;

  useEffect(() => {
    if (privacy) privacyDialog.current?.showModal();
    else privacyDialog.current?.close();
  }, [privacy]);

  useEffect(() => {
    const dialog = confirmationDialog.current;
    if (!confirmationOpen) {
      dialog?.close();
      return;
    }
    dialog?.showModal();
    confirmationButton.current?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [confirmationOpen]);

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
      const body = (await response.json()) as { message?: string; confirmation?: string };
      if (!response.ok) throw new Error(body.message || "We couldn't save your email. Please try again.");
      setStatus("success");
      setEmailConfirmation(body.confirmation);
      setMessage("");
      setConfirmationOpen(true);
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
          <button ref={signupButton} className="button" disabled={status === "saving"} type={status === "success" ? "button" : "submit"}
            onClick={status === "success" ? () => setConfirmationOpen(true) : undefined}>
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
          Early-access notification. Unsubscribe anytime.
          {" "}
          By joining, you agree to receive this email.{" "}
          <button type="button" className="text-button" onClick={() => setPrivacy(true)}>
            Privacy
          </button>
        </p>
      </form>

      <dialog ref={confirmationDialog} className="signup-confirmation" aria-labelledby={`${idPrefix}-confirmation-title`}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault(); last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first?.focus();
          }
        }}
        aria-describedby={`${idPrefix}-confirmation-description`} onClose={() => {
          setConfirmationOpen(false);
          signupButton.current?.focus({ preventScroll: true });
        }}>
        <button className="signup-confirmation-close" type="button" aria-label="Close confirmation" onClick={() => setConfirmationOpen(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <div className="signup-confirmation-art" aria-hidden="true">
          <span className="signup-confirmation-node" /><span className="signup-confirmation-check">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
          </span><span className="signup-confirmation-node" />
        </div>
        <p className="signup-confirmation-eyebrow">NodeDots Code · Early access</p>
        <h2 id={`${idPrefix}-confirmation-title`}>You&apos;re on the list.</h2>
        <p id={`${idPrefix}-confirmation-description`} className="signup-confirmation-description">We&apos;ll be in touch when early access opens.</p>
        <p className="signup-confirmation-email">{email.trim()}</p>
        {emailConfirmation === "sent" && <p className="signup-confirmation-note">A confirmation email is on its way. Check your inbox or spam folder.</p>}
        {emailConfirmation === "pending" && <p className="signup-confirmation-note">Your signup is saved. We couldn&apos;t send a confirmation email yet.</p>}
        <button ref={confirmationButton} className="signup-confirmation-done" type="button" onClick={() => setConfirmationOpen(false)}>Got it</button>
        <p className="signup-confirmation-footer">More clarity. Fewer loose ends.</p>
      </dialog>

          <dialog ref={privacyDialog} className="privacy-dialog" aria-labelledby={`${idPrefix}-privacy-title`} onClose={() => setPrivacy(false)}>
            <h2 id={`${idPrefix}-privacy-title`}>Waitlist privacy</h2>
            <p>
              We collect your email address and the time you join so we can send NodeDots early-access
              notifications. A confirmation email is sent through Resend after signup.
            </p>
            <p>
              We use short-lived, hashed request identifiers to limit automated abuse. This page does not
              connect to your repositories or process your code.
            </p>
            <p>
              Joining is optional. Emails include an unsubscribe option. Waitlist retention and the
              repository data handling are explained in the full privacy notice.
            </p>
            <p><a className="text-button" href="/privacy">Read the full privacy notice →</a></p>
            <button className="button" onClick={() => setPrivacy(false)} type="button">
              Got it
            </button>
          </dialog>
    </>
  );
}
