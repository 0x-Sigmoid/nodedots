import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import type { D1Database } from "@cloudflare/workers-types";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createD1WaitlistStore } from "./store";
let runtime:Miniflare;
let directory:string;
let database:D1Database;
function start(){return new Miniflare(convertV4MiniflareOptions({
 modules:true,script:"export default { fetch() { return new Response('test'); } };",
 compatibilityDate:"2026-10-08",d1Databases:{WAITLIST_DB:"00000000-0000-0000-0000-000000000001"},resourcePersistencePath:directory,
}));}
beforeAll(async()=>{
 directory=await mkdtemp(path.join(tmpdir(),"nodedots-d1-"));
 runtime=start();
 database=await runtime.getD1Database("WAITLIST_DB") as unknown as D1Database;
 for(const file of ["0001_waitlist.sql","0002_confirmation.sql"]) {
  const schema=await readFile(path.join(process.cwd(),"d1/migrations",file),"utf8");
  for(const statement of schema.replace(/^--.*$/gm,"").split(";")) if(statement.trim()) await database.prepare(statement).run();
 }
},60000);
afterAll(async()=>{await runtime?.dispose();if(directory)await rm(directory,{recursive:true,force:true});},30000);
describe("D1 waitlist persistence",()=>{
 it("claims a confirmation atomically and never sends a completed confirmation again",async()=>{
  const one=createD1WaitlistStore(database),two=createD1WaitlistStore(database);
  await one.add("confirmation@example.com",1000);
  const claims=await Promise.all([one.claimConfirmation("confirmation@example.com",1000),two.claimConfirmation("confirmation@example.com",1000)]);
  expect(claims.filter(Boolean)).toHaveLength(1);
  const claim=claims.find(Boolean)!;
  await one.completeConfirmation("confirmation@example.com",claim.claimId,1001);
  await one.add("confirmation@example.com",1002);
  expect(await two.claimConfirmation("confirmation@example.com",2000)).toBeNull();
  await two.removeByToken(claim.token);await two.removeByToken(claim.token);
  expect(await database.prepare("SELECT email FROM waitlist_signups WHERE email = ?").bind("confirmation@example.com").first()).toBeNull();
 });
 it("reclaims interrupted sends without letting stale attempts change the new claim",async()=>{
  const store=createD1WaitlistStore(database);
  await store.add("retry@example.com",1000);
  const first=(await store.claimConfirmation("retry@example.com",1000))!;
  expect(await store.claimConfirmation("retry@example.com",1001)).toBeNull();
  const second=(await store.claimConfirmation("retry@example.com",1301))!;
  expect(second.token).toBe(first.token);
  await store.releaseConfirmation("retry@example.com",first.claimId);
  expect(await store.claimConfirmation("retry@example.com",1302)).toBeNull();
  await store.releaseConfirmation("retry@example.com",second.claimId);
  expect(await store.claimConfirmation("retry@example.com",1303)).not.toBeNull();
 });
 it("deduplicates signup across clients and retains original consent time",async()=>{
  const first=createD1WaitlistStore(database),second=createD1WaitlistStore(database);
  await Promise.all([first.add("same@example.com",1000),second.add("same@example.com",1000)]);
  await second.add("same@example.com",2000);
  const rows=await database.prepare("SELECT * FROM waitlist_signups WHERE email = ?").bind("same@example.com").all();
  expect(rows.results).toHaveLength(1);
  expect(rows.results[0]).toMatchObject({email:"same@example.com",joined_at:1000,consent:1,consent_version:"launch-updates-v1"});
 });
 it("shares atomic rate limits across clients and expires old buckets",async()=>{
  const one=createD1WaitlistStore(database),two=createD1WaitlistStore(database);
  const allowed=await Promise.all(Array.from({length:6},(_,index)=>(index%2?one:two).allow("shared-key",1000)));
  expect(allowed.filter(Boolean)).toHaveLength(5);
  expect(await two.allow("shared-key",2201)).toBe(true);
 });
 it("survives a Worker runtime restart and removal is idempotent",async()=>{
  await createD1WaitlistStore(database).add("survives@example.com",3000);
  await runtime.dispose();runtime=start();
  database=await runtime.getD1Database("WAITLIST_DB") as unknown as D1Database;
  expect(await database.prepare("SELECT email FROM waitlist_signups WHERE email = ?").bind("survives@example.com").first()).toEqual({email:"survives@example.com"});
  const store=createD1WaitlistStore(database);
  await store.remove("survives@example.com");await store.remove("survives@example.com");
  expect(await database.prepare("SELECT email FROM waitlist_signups WHERE email = ?").bind("survives@example.com").first()).toBeNull();
 },30000);
});
