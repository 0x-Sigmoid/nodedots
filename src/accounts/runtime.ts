import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { cookies } from "next/headers";
import { hashToken, sessionCookie, unseal } from "./security";

export async function accountRuntime() {
 const {env} = await getCloudflareContext({async:true});
 const values = env as unknown as Record<string, string | D1Database | undefined>;
 const get = (name:string) => String(process.env.NODE_ENV === "development" ? process.env[name] || values[name] || "" : values[name] || process.env[name] || "");
 const origin = new URL(get("NODEDOTS_APP_URL") || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://nodedots.com")).origin;
 const config = {origin, clientId:get("GITHUB_CLIENT_ID"), clientSecret:get("GITHUB_CLIENT_SECRET"), slug:get("GITHUB_APP_SLUG"), secret:get("AUTH_SECRET")};
 return { ...config, appId:get("GITHUB_APP_ID"), privateKey:get("GITHUB_PRIVATE_KEY_PEM"), webhookSecret:get("GITHUB_WEBHOOK_SECRET"), runnerSecret:get("WORKSPACE_RUNNER_SECRET"), privateRepositories:get("ALLOW_PRIVATE_REPOSITORIES")==="1", db:values.WAITLIST_DB as D1Database, ready:!!(config.clientId && config.clientSecret && config.slug && config.secret.length >= 32 && values.WAITLIST_DB) };
}
export type AccountRuntime = Awaited<ReturnType<typeof accountRuntime>>;
export type AccountSession = {githubId:number; login:string; token:string};
export async function currentSession(runtime:AccountRuntime):Promise<AccountSession|null> {
 if (!runtime.ready) return null;
 const raw = (await cookies()).get(sessionCookie)?.value;
 if (!raw) return null;
 const row = await runtime.db.prepare("SELECT github_id, login, token_cipher FROM account_sessions WHERE id_hash = ? AND expires_at > ?").bind(hashToken(raw),Date.now()).first<{github_id:number;login:string;token_cipher:string}>();
 if (!row) return null;
 const token = unseal<string>(row.token_cipher,runtime.secret);
 return token ? {githubId:row.github_id,login:row.login,token} : null;
}
