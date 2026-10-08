import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({add:vi.fn(),remove:vi.fn(),allow:vi.fn(),get:vi.fn(),send:vi.fn()}));
vi.mock("@/waitlist/store",()=>({getWaitlistStore:mocks.get}));
vi.mock("@/waitlist/confirmation",()=>({sendWaitlistConfirmation:mocks.send}));
import { DELETE, POST } from "./route";
const json=(method:string,body:unknown,origin="http://localhost:3000")=>new Request("http://localhost:3000/api/waitlist",{
 method,headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify(body),
});
beforeEach(()=>{
 vi.clearAllMocks();
 mocks.get.mockResolvedValue({add:mocks.add,remove:mocks.remove,allow:mocks.allow});
 mocks.add.mockResolvedValue(undefined);mocks.remove.mockResolvedValue(undefined);mocks.allow.mockResolvedValue(true);
 mocks.send.mockResolvedValue("sent");
});
afterEach(()=>vi.restoreAllMocks());
describe("durable waitlist signup",()=>{
 it("normalizes email and waits for storage before returning success",async()=>{
  const result=await POST(json("POST",{email:"  HELLO@Example.com ",consent:true}));
  expect(result.status).toBe(200);
  expect(mocks.add).toHaveBeenCalledWith("hello@example.com",expect.any(Number));
  expect(mocks.send).toHaveBeenCalledWith(expect.any(Object),"hello@example.com",expect.any(Number));
  expect(await result.json()).toMatchObject({confirmation:"sent"});
 });
 it("never acknowledges a signup when the binding is unavailable",async()=>{
  mocks.get.mockRejectedValue(new Error("Missing binding"));
  expect((await POST(json("POST",{email:"test@example.com",consent:true}))).status).toBe(503);
  expect(mocks.send).not.toHaveBeenCalled();
 });
 it("preserves a successful signup when confirmation delivery is pending",async()=>{
  mocks.send.mockResolvedValue("pending");
  const result=await POST(json("POST",{email:"test@example.com",consent:true}));
  expect(result.status).toBe(200);
  expect(await result.json()).toMatchObject({confirmation:"pending"});
 });
 it("never acknowledges failed database writes",async()=>{
  mocks.add.mockRejectedValue(new Error("D1 unavailable"));
  expect((await POST(json("POST",{email:"test@example.com",consent:true}))).status).toBe(503);
 });
 it("requires consent, valid shape, and an allowed origin",async()=>{
  expect((await POST(json("POST",{email:"test@example.com"}))).status).toBe(400);
  expect((await POST(json("POST",null))).status).toBe(400);
  expect((await POST(json("POST",{email:"test@example.com",consent:true},"https://other.example"))).status).toBe(403);
  expect(mocks.add).not.toHaveBeenCalled();
 });
 it("rejects oversized submissions and ignores honeypots",async()=>{
  expect((await POST(json("POST",{email:"test@example.com",consent:true,padding:"x".repeat(2100)}))).status).toBe(413);
  expect((await POST(json("POST",{email:"test@example.com",consent:true,website:"bot"}))).status).toBe(200);
  expect(mocks.get).not.toHaveBeenCalled();
 });
 it("blocks shared rate limits without writing a signup",async()=>{
  mocks.allow.mockResolvedValue(false);
  const response=await POST(json("POST",{email:"test@example.com",consent:true}));
  expect(response.status).toBe(429);expect(response.headers.get("Retry-After")).toBe("600");expect(mocks.add).not.toHaveBeenCalled();
 });
 it("removes normalized emails and exposes no presence information",async()=>{
  const response=await DELETE(json("DELETE",{email:"HELLO@Example.com"}));
  expect(response.status).toBe(200);expect(mocks.remove).toHaveBeenCalledWith("hello@example.com");
  const again=await DELETE(json("DELETE",{email:"hello@example.com"}));
  expect(await again.json()).toEqual(await response.json());
 });
 it("rejects invalid removal and reports storage failures",async()=>{
  expect((await DELETE(json("DELETE",{email:"not-email"}))).status).toBe(400);
  expect((await DELETE(json("DELETE",null))).status).toBe(400);
  mocks.remove.mockRejectedValue(new Error("Unavailable"));
  expect((await DELETE(json("DELETE",{email:"test@example.com"}))).status).toBe(503);
 });
});
