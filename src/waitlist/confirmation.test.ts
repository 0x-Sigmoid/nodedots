import { describe, expect, it, vi } from "vitest";
import { deliverConfirmation } from "./confirmation";
import type { WaitlistStore } from "./store";

const token="f341b97e-9e9e-4163-8d54-c17a4d69f061";
function setup() {
 const store: WaitlistStore = {
  add:vi.fn(),remove:vi.fn(),allow:vi.fn(),removeByToken:vi.fn(),
  claimConfirmation:vi.fn().mockResolvedValue({token,claimId:"attempt"}),
  completeConfirmation:vi.fn(),releaseConfirmation:vi.fn(),
 };
 const send=vi.fn<typeof fetch>().mockResolvedValue(Response.json({id:"receipt"}));
 return {store,send};
}
describe("waitlist confirmation",()=>{
 it("sends the email with an unsubscribe link and stable provider idempotency key",async()=>{
  const {store,send}=setup();
  expect(await deliverConfirmation(store,"hello@example.com",1000,{RESEND_API_KEY:"test-key"},send)).toBe("sent");
  const [url,request]=send.mock.calls[0];
  expect(url).toBe("https://api.resend.com/emails");
  expect(request?.headers).toMatchObject({"Idempotency-Key":`waitlist-confirmation/${token}`});
  const body=JSON.parse(request?.body as string);
  expect(body.to).toEqual(["hello@example.com"]);
  expect(body.text).toContain(`/waitlist/unsubscribe?token=${token}`);
  expect(body.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  expect(store.completeConfirmation).toHaveBeenCalledWith("hello@example.com","attempt",1000);
 });
 it("skips provider calls when credentials are missing or another request owns the send",async()=>{
  const {store,send}=setup();
  expect(await deliverConfirmation(store,"hello@example.com",1000,{},send)).toBe("pending");
  expect(store.claimConfirmation).not.toHaveBeenCalled();
  vi.mocked(store.claimConfirmation).mockResolvedValue(null);
  expect(await deliverConfirmation(store,"hello@example.com",1000,{RESEND_API_KEY:"test-key"},send)).toBe("already_sent");
  expect(send).not.toHaveBeenCalled();
 });
 it.each(["rejection","timeout","missing receipt"])("keeps failed delivery retryable: %s",async(failure)=>{
  const {store,send}=setup();
  if(failure==="timeout")send.mockRejectedValue(new Error("Timeout"));
  else send.mockResolvedValue(failure==="rejection" ? new Response("",{status:422}) : Response.json({}));
  expect(await deliverConfirmation(store,"hello@example.com",1000,{RESEND_API_KEY:"test-key"},send)).toBe("pending");
  expect(store.releaseConfirmation).toHaveBeenCalledWith("hello@example.com","attempt");
  expect(store.completeConfirmation).not.toHaveBeenCalled();
 });
});
