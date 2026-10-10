import {beforeEach,describe,expect,it,vi} from "vitest";
import {seal,unseal} from "@/accounts/security";
const mocks=vi.hoisted(()=>({runtime:vi.fn(),cookies:vi.fn(),github:vi.fn(),batch:vi.fn(),bind:vi.fn()}));
vi.mock("@/accounts/runtime",()=>({accountRuntime:mocks.runtime}));
vi.mock("next/headers",()=>({cookies:mocks.cookies}));
vi.mock("@/accounts/github",()=>({github:mocks.github}));
import {GET} from "./route";
const secret="test-only-32-char-secret-material-12345";
describe("OAuth callback",()=>{
 beforeEach(()=>{vi.resetAllMocks();mocks.runtime.mockResolvedValue({origin:"https://nodedots.com",ready:true,secret,clientId:"test-id",clientSecret:"test-secret",db:{prepare:()=>({bind:mocks.bind}),batch:mocks.batch}});mocks.bind.mockReturnValue({});mocks.cookies.mockResolvedValue({get:()=>({value:seal({state:"good-state",verifier:"test-verifier",expires:Date.now()+60000},secret)})});});
 it("rejects a forged state without exchanging a token",async()=>{const fetchMock=vi.fn();vi.stubGlobal("fetch",fetchMock);const response=await GET(new Request("https://nodedots.com/api/account/callback?state=forged&code=code"));expect(fetchMock).not.toHaveBeenCalled();expect(mocks.batch).not.toHaveBeenCalled();expect(response.headers.get("location")).toContain("notice=auth");vi.unstubAllGlobals();});
 it("rejects an expired flow",async()=>{mocks.cookies.mockResolvedValue({get:()=>({value:seal({state:"good-state",verifier:"x",expires:0},secret)})});const response=await GET(new Request("https://nodedots.com/api/account/callback?state=good-state&code=code"));expect(mocks.github).not.toHaveBeenCalled();expect(response.headers.get("location")).toContain("notice=auth");});
 it("handles a denied GitHub authorization",async()=>{const response=await GET(new Request("https://nodedots.com/api/account/callback?error=access_denied&state=good-state"));expect(mocks.batch).not.toHaveBeenCalled();expect(response.headers.get("set-cookie")).toContain("nd_oauth=");});
 it("stores an encrypted token and a hashed session; uses secure HTTP-only cookies",async()=>{
  const fetchMock=vi.fn().mockResolvedValue(Response.json({access_token:"ghu_test_secret",expires_in:28800}));vi.stubGlobal("fetch",fetchMock);mocks.github.mockResolvedValue({id:42,login:"tester"});
  const response=await GET(new Request("https://nodedots.com/api/account/callback?state=good-state&code=code"));
  expect(response.headers.get("location")).toBe("https://nodedots.com/onboarding");
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");expect(response.headers.get("set-cookie")).toContain("Secure");expect(response.headers.get("set-cookie")).not.toContain("ghu_test_secret");
  expect(mocks.bind.mock.calls[1][0]).toMatch(/^[a-f0-9]{64}$/);expect(unseal(mocks.bind.mock.calls[1][3],secret)).toBe("ghu_test_secret");
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).code_verifier).toBe("test-verifier");vi.unstubAllGlobals();
 });
 it("reports the failed identity stage without logging tokens or authorization codes",async()=>{
  const logging=vi.spyOn(console,"log").mockImplementation(()=>{});
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(Response.json({access_token:"ghu_sensitive_value"})));
  mocks.github.mockRejectedValue(Object.assign(new Error("ghu_sensitive_value"),{status:403}));
  const response=await GET(new Request("https://nodedots.com/api/account/callback?state=good-state&code=private-code"));
  expect(response.headers.get("location")).toContain("reason=identity");expect(mocks.batch).not.toHaveBeenCalled();
  const recorded=JSON.stringify(logging.mock.calls);expect(recorded).toContain('identity');expect(recorded).not.toContain("ghu_sensitive_value");expect(recorded).not.toContain("private-code");logging.mockRestore();vi.unstubAllGlobals();
 });
 it("identifies incorrect app credentials without exposing upstream response bodies",async()=>{
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(Response.json({error:"incorrect_client_credentials",error_description:"private upstream details"})));
  const response=await GET(new Request("https://nodedots.com/api/account/callback?state=good-state&code=private-code"));
  expect(response.headers.get("location")).toContain("reason=configuration");expect(mocks.github).not.toHaveBeenCalled();vi.unstubAllGlobals();
 });
});
