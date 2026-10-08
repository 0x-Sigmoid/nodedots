import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({removeByToken:vi.fn(),get:vi.fn()}));
vi.mock("@/waitlist/store",()=>({getWaitlistStore:mocks.get}));
import { POST } from "./route";
const token="f341b97e-9e9e-4163-8d54-c17a4d69f061";
beforeEach(()=>{vi.clearAllMocks();mocks.get.mockResolvedValue({removeByToken:mocks.removeByToken});mocks.removeByToken.mockResolvedValue(undefined);});
describe("token unsubscribe",()=>{
 it("accepts one-click POSTs and returns the same result for an already removed token",async()=>{
  const request=()=>new Request(`https://nodedots.com/api/waitlist/unsubscribe?token=${token}`,{method:"POST",body:"List-Unsubscribe=One-Click"});
  const first=await POST(request()),second=await POST(request());
  expect(first.status).toBe(200);expect(await first.json()).toEqual(await second.json());
  expect(mocks.removeByToken).toHaveBeenCalledWith(token);
 });
 it("rejects invalid tokens and never claims success when storage fails",async()=>{
  expect((await POST(new Request("https://nodedots.com/api/waitlist/unsubscribe?token=bad",{method:"POST"}))).status).toBe(400);
  expect(mocks.get).not.toHaveBeenCalled();
  mocks.removeByToken.mockRejectedValue(new Error("Unavailable"));
  expect((await POST(new Request(`https://nodedots.com/api/waitlist/unsubscribe?token=${token}`,{method:"POST"}))).status).toBe(503);
 });
});
