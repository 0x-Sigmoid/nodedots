import { describe, expect, it } from "vitest";
import { DELETE, POST } from "./route";

const json = (method: string, body: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/waitlist", {
    method,
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });

describe("waitlist signup and removal", () => {
  it("signs up, dedupes, then removes idempotently", async () => {
    const email = `hardening-${Date.now()}@example.com`;
    const first = await POST(json("POST", { email, consent: true }));
    expect(first.status).toBe(200);
    const duplicate = await POST(json("POST", { email, consent: true }));
    expect(duplicate.status).toBe(200);
    expect(await duplicate.json()).toEqual(await first.json());

    const removed = await DELETE(json("DELETE", { email }));
    expect(removed.status).toBe(200);
    const removedBody = (await removed.json()) as { message: string };
    expect(removedBody.message).toMatch(/won't hear/i);

    // Removing again (or never present) returns the identical message.
    const again = await DELETE(json("DELETE", { email }));
    expect(again.status).toBe(200);
    expect(await again.json()).toEqual(removedBody);
  });

  it("validates removal input", async () => {
    const bad = await DELETE(json("DELETE", { email: "not-an-email" }));
    expect(bad.status).toBe(400);
    const missing = await DELETE(json("DELETE", {}));
    expect(missing.status).toBe(400);
    const wrongType = await DELETE(
      new Request("http://localhost:3000/api/waitlist", { method: "DELETE", body: "{}" }),
    );
    expect(wrongType.status).toBe(415);
  });
});
