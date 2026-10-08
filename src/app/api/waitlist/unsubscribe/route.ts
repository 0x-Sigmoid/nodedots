import { getWaitlistStore } from "@/waitlist/store";

const validUnsubscribeToken = (token: string | null): token is string =>
 !!token && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

// GET never changes consent: email link scanners must not unsubscribe people.
export async function POST(request: Request) {
 const token = new URL(request.url).searchParams.get("token");
 if (!validUnsubscribeToken(token)) return Response.json({ message: "Invalid unsubscribe link." },{status:400,headers});
 try {
  await (await getWaitlistStore()).removeByToken(token);
  return Response.json({ message: "You're unsubscribed. You won't receive NodeDots waitlist updates." },{headers});
 } catch {
  return Response.json({ message: "We couldn't update your preference. Please try again." },{status:503,headers});
 }
}
