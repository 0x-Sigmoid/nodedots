/**
 * GitHub App authentication (docs/13): short-lived installation tokens
 * minted on demand from the App identity. Tokens are returned to the caller
 * only — never logged, never persisted, never exposed to models.
 */
import { createSign } from "node:crypto";

export const GITHUB_API_BASE = "https://api.github.com";

function base64url(input: string | Buffer): string {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** RS256 App JWT, valid for 10 minutes with 60s clock-skew allowance. */
export function createAppJwt(appId: string, privateKeyPem: string, nowSec = Math.floor(Date.now() / 1000)): string {
  const normalized = privateKeyPem.includes("\\n") ? privateKeyPem.replace(/\\n/g, "\n") : privateKeyPem;
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iat: nowSec - 60, exp: nowSec + 600, iss: appId }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${base64url(signer.sign(normalized))}`;
}

export interface InstallationToken {
  token: string;
  expiresAt: string;
}

export async function mintInstallationToken(
  input: { apiBase?: string; appId: string; privateKeyPem: string; installationId: number },
  post: typeof fetch = fetch,
): Promise<InstallationToken> {
  const apiBase = (input.apiBase ?? GITHUB_API_BASE).replace(/\/$/, "");
  const jwt = createAppJwt(input.appId, input.privateKeyPem);
  const response = await post(`${apiBase}/app/installations/${input.installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "NodeDots-Code",
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!response.ok) {
    throw new Error(`installation-token-${response.status}`);
  }
  const body = (await response.json()) as { token?: unknown; expires_at?: unknown };
  if (typeof body.token !== "string" || typeof body.expires_at !== "string") {
    throw new Error("installation-token-shape");
  }
  return { token: body.token, expiresAt: body.expires_at };
}

/** Resolve an installation token from env: static token first, else App minting per installation. */
export function tokenResolverFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): (installationId: number | null) => Promise<string | null> {
  return async (installationId) => {
    if (env.GITHUB_INSTALLATION_TOKEN) return env.GITHUB_INSTALLATION_TOKEN;
    const appId = env.GITHUB_APP_ID;
    const privateKeyPem = env.GITHUB_PRIVATE_KEY_PEM;
    if (appId && privateKeyPem && installationId !== null) {
      const minted = await mintInstallationToken({ appId, privateKeyPem, installationId });
      return minted.token;
    }
    return null;
  };
}
