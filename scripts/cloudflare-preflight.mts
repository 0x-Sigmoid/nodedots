import { readFile } from "node:fs/promises";
const config = JSON.parse(await readFile(new URL("../wrangler.jsonc",import.meta.url),"utf8"));
const database = config.d1_databases?.find((item: {binding:string}) => item.binding === "WAITLIST_DB");
if (!database || database.database_id === "00000000-0000-0000-0000-000000000000") {
 console.error("Create the D1 database and replace database_id in wrangler.jsonc before a remote migration or deployment.");
 process.exitCode = 1;
}
