import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { WaitlistStore } from "./store";

type EmailConfig = { RESEND_API_KEY?: string; WAITLIST_EMAIL_FROM?: string };
export type ConfirmationStatus = "sent" | "already_sent" | "pending";

export function confirmationMessage(email: string, token: string, from: string) {
 const unsubscribe = `https://nodedots.com/waitlist/unsubscribe?token=${encodeURIComponent(token)}`;
 const oneClick = `https://nodedots.com/api/waitlist/unsubscribe?token=${encodeURIComponent(token)}`;
 return {
  from, to: [email], subject: "You're on the NodeDots waitlist",
  text: `You're on the list.\n\nThanks for joining NodeDots Code. NodeDots checks pull requests against the rest of your codebase to flag what breaks, is missing, or needs a test before you merge.\n\nWe'll send one email when early access opens. No action is needed now.\n\nExplore what's coming: https://nodedots.com/waitlist/vision\n\nUnsubscribe: ${unsubscribe}\n\nNodeDots — Connect the dots. Before you ship.`,
  html: `<div style="background:#f8f7fc;padding:32px 16px;font-family:Arial,sans-serif;color:#211833"><div style="max-width:520px;margin:auto;background:#fff;border:1px solid #e8e3ef;border-radius:20px;padding:32px"><p style="font-size:15px;font-weight:bold;letter-spacing:1px">● NodeDots</p><h1 style="font-size:30px;line-height:1.15">You're on the list.</h1><p style="line-height:1.7">Thanks for joining NodeDots Code. NodeDots checks pull requests against the rest of your codebase to flag what breaks, is missing, or needs a test before you merge.</p><p style="line-height:1.7">We'll send one email when early access opens. No action is needed now.</p><p style="margin:28px 0"><a href="https://nodedots.com/waitlist/vision" style="background:#d5ef79;color:#211833;text-decoration:none;border-radius:24px;padding:12px 20px;display:inline-block">Explore what's coming</a></p><p style="font-size:12px;line-height:1.6;color:#726981">Connect the dots. Before you ship.<br>You received this because you joined the NodeDots waitlist. <a href="${unsubscribe}" style="color:#726981">Unsubscribe</a></p></div></div>`,
  headers: { "List-Unsubscribe": `<${oneClick}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
 };
}

export async function deliverConfirmation(
 store: WaitlistStore, email: string, now: number, config: EmailConfig, send: typeof fetch = fetch,
): Promise<ConfirmationStatus> {
 if (!config.RESEND_API_KEY) return "pending";
 const claim = await store.claimConfirmation(email, now);
 if (!claim) return "already_sent";
 try {
  const response = await send("https://api.resend.com/emails", {
   method: "POST", headers: {
    Authorization: `Bearer ${config.RESEND_API_KEY}`, "Content-Type": "application/json",
    "Idempotency-Key": `waitlist-confirmation/${claim.token}`,
   },
   body: JSON.stringify(confirmationMessage(email, claim.token, config.WAITLIST_EMAIL_FROM || "NodeDots <welcome@nodedots.com>")),
   signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Email provider rejected confirmation");
  const data = await response.json() as { id?: unknown };
  if (typeof data.id !== "string" || !data.id) throw new Error("Missing email receipt");
  await store.completeConfirmation(email, claim.claimId, now);
  return "sent";
 } catch {
  // Never log recipients, unsubscribe tokens, provider responses, or API keys.
  await store.releaseConfirmation(email, claim.claimId);
  return "pending";
 }
}

export async function sendWaitlistConfirmation(store: WaitlistStore, email: string, now: number) {
 try {
  const { env } = await getCloudflareContext({ async: true });
  return await deliverConfirmation(store, email, now, env as unknown as EmailConfig);
 } catch { return "pending" as const; }
}
