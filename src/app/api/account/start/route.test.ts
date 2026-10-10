import {beforeEach,describe,it,expect,vi} from "vitest";
const mocks=vi.hoisted(()=>({runtime:vi.fn()}));
vi.mock("@/accounts/runtime",()=>({accountRuntime:mocks.runtime}));
import {GET} from "./route";
describe("OAuth authorization start",()=>{
 beforeEach(()=>mocks.runtime.mockResolvedValue({origin:"https://nodedots.com",ready:true,clientId:"public-client",secret:"test-only-32-char-session-secret-12345"}));
 it("moves preview visitors to the callback hostname before setting an OAuth cookie",async()=>{
  const response=await GET(new Request("https://nodedots.sgukobong.workers.dev/api/account/start"));
  expect(response.headers.get("location")).toBe("https://nodedots.com/api/account/start");expect(response.headers.get("set-cookie")).toBeNull();
 });
 it("uses PKCE, the production callback, and secure HTTP-only cookies",async()=>{
  const response=await GET(new Request("https://nodedots.com/api/account/start"));
  const target=new URL(response.headers.get("location")!);
  expect(target.origin).toBe("https://github.com");expect(target.searchParams.get("redirect_uri")).toBe("https://nodedots.com/api/account/callback");expect(target.searchParams.get("code_challenge_method")).toBe("S256");expect(target.searchParams.get("state")).toHaveLength(43);
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");expect(response.headers.get("set-cookie")).toContain("Secure");
 });
 it("does not begin authorization before all setup is available",async()=>{
  mocks.runtime.mockResolvedValue({origin:"https://nodedots.com",ready:false});const response=await GET(new Request("https://nodedots.com/api/account/start"));
  expect(response.headers.get("location")).toBe("https://nodedots.com/onboarding?notice=setup");expect(response.headers.get("set-cookie")).toBeNull();
 });
});
