import {afterEach,describe,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({context:vi.fn()}));
vi.mock("@opennextjs/cloudflare",()=>({getCloudflareContext:mocks.context}));
import {accountRuntime} from "./runtime";
afterEach(()=>vi.unstubAllEnvs());
describe("account environment boundaries",()=>{
 const worker={WAITLIST_DB:{},NODEDOTS_APP_URL:"https://nodedots.com",GITHUB_APP_SLUG:"nodedots-code",GITHUB_CLIENT_ID:"public-id",GITHUB_CLIENT_SECRET:"worker-secret",AUTH_SECRET:"worker-session-key-at-least-32-chars"};
 it("uses deployed origin and credentials over local build environment in production",async()=>{
  vi.stubEnv("NODE_ENV","production");vi.stubEnv("NODEDOTS_APP_URL","http://localhost:3000");vi.stubEnv("GITHUB_CLIENT_SECRET","local-secret");mocks.context.mockResolvedValue({env:worker});
  const runtime=await accountRuntime();expect(runtime.origin).toBe("https://nodedots.com");expect(runtime.clientSecret).toBe("worker-secret");expect(runtime.ready).toBe(true);expect(runtime.privateRepositories).toBe(false);
 });
 it("keeps local callbacks on localhost when production vars are in wrangler",async()=>{
  vi.stubEnv("NODE_ENV","development");vi.stubEnv("NODEDOTS_APP_URL","http://localhost:3000");vi.stubEnv("GITHUB_CLIENT_SECRET","local-secret");mocks.context.mockResolvedValue({env:worker});
  const runtime=await accountRuntime();expect(runtime.origin).toBe("http://localhost:3000");expect(runtime.clientSecret).toBe("local-secret");
 });
 it("requires credentials and persistent session storage before enabling sign-in",async()=>{
  vi.stubEnv("NODE_ENV","production");vi.stubEnv("GITHUB_CLIENT_SECRET","");mocks.context.mockResolvedValue({env:{...worker,WAITLIST_DB:undefined,GITHUB_CLIENT_SECRET:undefined}});
  expect((await accountRuntime()).ready).toBe(false);
 });
});
