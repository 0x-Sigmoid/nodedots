import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const sessionCookie = "nd_session";
export const flowCookie = "nd_oauth";
export const randomToken = () => randomBytes(32).toString("base64url");
export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const pkceChallenge = (value: string) => createHash("sha256").update(value).digest("base64url");
function key(secret: string) {
 if (secret.length < 32) throw new Error("Account encryption key is not configured");
 return createHash("sha256").update(secret).digest();
}
export function seal(value: unknown, secret: string): string {
 const iv = randomBytes(12);
 const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
 const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
 return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}
export function unseal<T>(value: string, secret: string): T | null {
 try {
  const data = Buffer.from(value, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key(secret), data.subarray(0,12));
  decipher.setAuthTag(data.subarray(12,28));
  return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8")) as T;
 } catch { return null; }
}
export function validMutation(request: Request, origin: string): boolean {
 return request.headers.get("origin") === origin && request.headers.get("sec-fetch-site") !== "cross-site";
}
export function validSelection(value: unknown): value is { installation: number; repository: number; pull: number } {
 if (!value || typeof value !== "object") return false;
 const input = value as Record<string, unknown>;
 return [input.installation, input.repository, input.pull].every(v => Number.isSafeInteger(v) && Number(v) > 0);
}
