import type {MessageBatch,D1Database} from "@cloudflare/workers-types";
type Env={NODEDOTS_APP_URL:string;WORKSPACE_RUNNER_SECRET:string;WAITLIST_DB:D1Database};
export default {
 async queue(batch:MessageBatch<{id:string}>,env:Env){for(const message of batch.messages){try{const response=await fetch(`${env.NODEDOTS_APP_URL}/api/workspace/run`,{method:"POST",headers:{Authorization:`Bearer ${env.WORKSPACE_RUNNER_SECRET}`,"Content-Type":"application/json"},body:JSON.stringify(message.body),signal:AbortSignal.timeout(150000)});if(response.ok)message.ack();else message.retry({delaySeconds:180});}catch{message.retry({delaySeconds:180});}}},
 async scheduled(_event:unknown,env:Env){const now=Date.now();await env.WAITLIST_DB.batch([
  env.WAITLIST_DB.prepare("UPDATE workspace_jobs SET status='failed',stage='failed',error='Background review timed out. Retry from the inbox.',token_cipher=NULL WHERE status IN ('queued','running') AND updated_at<?").bind(now-1800000),
  env.WAITLIST_DB.prepare("DELETE FROM workspace_feedback WHERE review_id IN (SELECT id FROM workspace_reviews WHERE expires_at<=?)").bind(now),
  env.WAITLIST_DB.prepare("DELETE FROM workspace_reviews WHERE expires_at<=?").bind(now),
  env.WAITLIST_DB.prepare("DELETE FROM workspace_jobs WHERE expires_at<=?").bind(now),
  env.WAITLIST_DB.prepare("DELETE FROM workspace_deliveries WHERE received_at<?").bind(now-7*86400000),
  env.WAITLIST_DB.prepare("DELETE FROM account_sessions WHERE expires_at<=?").bind(now)
 ]);}
};
