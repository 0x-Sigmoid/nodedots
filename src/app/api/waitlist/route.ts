const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const received = () => Response.json({ message: "Early-access signup received." }, { headers });

// In-memory store for the root landing page. Duplicate emails receive the
// same success response without creating a second entry. For a persistent
// production list, back this contract with a database (see waitlist/).
const signups = new Map<string, number>();
const limits = new Map<string, { attempts: number; expiresAt: number }>();

async function rateKey(ip: string, window: number) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${ip}:${window}:nodedots-waitlist`),
  );
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin, "https://nodedots.com", "https://www.nodedots.com"]);
  if (!origin || !allowed.has(origin)) {
    return Response.json({ message: "Please join from the NodeDots website." }, { status: 403, headers });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ message: "Invalid submission." }, { status: 415, headers });
  }
  if (Number(request.headers.get("content-length") || 0) > 2048) {
    return Response.json({ message: "Submission too large." }, { status: 413, headers });
  }

  let data: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("No body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        return Response.json({ message: "Submission too large." }, { status: 413, headers });
      }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    data = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid shape");
  } catch {
    return Response.json({ message: "Invalid submission." }, { status: 400, headers });
  }

  // Honeypot: pretend to accept automated submissions.
  if (typeof data.website === "string" && data.website.trim()) return received();
  if (typeof data.email !== "string" || data.consent !== true) {
    return Response.json(
      { message: "An email address and permission to send updates are required." },
      { status: 400, headers },
    );
  }
  const email = data.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400, headers });
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const window = Math.floor(now / 600);
    for (const [key, entry] of limits) {
      if (entry.expiresAt < now) limits.delete(key);
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = await rateKey(ip, window);
    const entry = limits.get(key);
    const attempts = (entry?.attempts || 0) + 1;
    limits.set(key, { attempts, expiresAt: now + 1200 });
    if (attempts > 5) {
      return Response.json(
        { message: "Too many attempts. Please try again in ten minutes." },
        { status: 429, headers: { ...headers, "Retry-After": "600" } },
      );
    }
    if (!signups.has(email)) signups.set(email, now);
    return received();
  } catch {
    return Response.json(
      { message: "We couldn't save your email right now. Please try again shortly." },
      { status: 503, headers },
    );
  }
}
