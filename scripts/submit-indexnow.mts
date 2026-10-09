import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Run only after a content deployment. The key file is intentionally public:
// IndexNow verifies host ownership by fetching it from the canonical website.
const directory = join(process.cwd(), "public");
const keyFiles = readdirSync(directory).filter(name => /^[a-f0-9]{64}\.txt$/.test(name));
if (keyFiles.length !== 1) throw new Error("Expected one deployed IndexNow verification file.");
const key = readFileSync(join(directory, keyFiles[0]), "utf8").trim();
if (keyFiles[0] !== `${key}.txt`) throw new Error("Invalid IndexNow verification file.");
const origin = "https://nodedots.com";
const keyLocation = `${origin}/${keyFiles[0]}`;
const check = await fetch(keyLocation, { signal: AbortSignal.timeout(15000) });
if (!check.ok || (await check.text()).trim() !== key) throw new Error("Deploy the matching key file before submitting.");
const urlList = ["/", "/waitlist", "/vision", "/privacy"].map(path => `${origin}${path}`);
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: "nodedots.com", key, keyLocation, urlList }),
  signal: AbortSignal.timeout(20000),
});
if (![200, 202].includes(response.status)) throw new Error(`IndexNow returned HTTP ${response.status}.`);
console.log(`IndexNow received ${urlList.length} canonical URLs: HTTP ${response.status}${response.status === 202 ? " (key validation pending)" : ""}. This does not confirm indexing or rankings.`);
