import { getWaitlistStore } from "@/waitlist/store";
import { sendWaitlistConfirmation } from "@/waitlist/confirmation";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const received = () => Response.json({ message: "Early-access signup received." }, { headers });
const unavailable = () => Response.json(
 { message: "We couldn't save your email right now. Please try again shortly." }, { status: 503, headers },
);
const validEmail = (value: unknown): value is string =>
 typeof value === "string" && value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

async function rateKey(request: Request, now: number) {
 const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
 const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(
  ip + ":" + Math.floor(now / 600) + ":nodedots-waitlist",
 ));
 return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("");
}

async function readSubmission(request: Request): Promise<Record<string,unknown> | Response> {
 const origin = request.headers.get("origin");
 const allowed = new Set([new URL(request.url).origin, "https://nodedots.com", "https://www.nodedots.com"]);
 if (!origin || !allowed.has(origin)) return Response.json({ message: "Please join from the NodeDots website." },{status:403,headers});
 if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({message:"Invalid submission."},{status:415,headers});
 try {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("No body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
   const part = await reader.read();
   if (part.done) break;
   size += part.value.byteLength;
   if (size > 2048) {await reader.cancel();return Response.json({message:"Submission too large."},{status:413,headers});}
   chunks.push(part.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.byteLength;}
  const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid shape");
  return data as Record<string,unknown>;
 } catch {return Response.json({message:"Invalid submission."},{status:400,headers});}
}

export async function POST(request: Request) {
 const data = await readSubmission(request);
 if (data instanceof Response) return data;
 if (typeof data.website === "string" && data.website.trim()) return received();
 if (!validEmail(data.email) || data.consent !== true) return Response.json(
  {message:"An email address and permission to send updates are required."},{status:400,headers},
 );
 const email = data.email.trim().toLowerCase();
 try {
  const store = await getWaitlistStore();
  const now = Math.floor(Date.now()/1000);
  if (!(await store.allow(await rateKey(request,now),now))) return Response.json(
   {message:"Too many attempts. Please try again in ten minutes."},{status:429,headers:{...headers,"Retry-After":"600"}},
  );
  await store.add(email,now);
  const confirmation = await sendWaitlistConfirmation(store,email,now);
  return Response.json({ message: "Early-access signup received.", confirmation },{headers});
 } catch {return unavailable();}
}

export async function DELETE(request: Request) {
 const data = await readSubmission(request);
 if (data instanceof Response) return data;
 if (!validEmail(data.email)) return Response.json({message:"An email address is required."},{status:400,headers});
 try {
  const store = await getWaitlistStore();
  const now = Math.floor(Date.now()/1000);
  if (!(await store.allow(await rateKey(request,now),now))) return Response.json(
   {message:"Too many attempts. Please try again in ten minutes."},{status:429,headers:{...headers,"Retry-After":"600"}},
  );
  await store.remove(data.email.trim().toLowerCase());
  return Response.json({message:"Removed. You won't hear from us again."},{headers});
 } catch {return unavailable();}
}
