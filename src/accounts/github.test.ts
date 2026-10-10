import {describe,it,expect,vi} from "vitest";
import {authorizedRepository,repositories} from "./github";
const install={id:11,account:{login:"owner"},app_slug:"nodedots-code",suspended_at:null};
describe("GitHub authorization",()=>{
 it("rejects a forged installation before querying repositories",async()=>{
  const get=vi.fn().mockResolvedValue(Response.json({installations:[install]}));
  await expect(repositories("token",99,"nodedots-code",get)).rejects.toMatchObject({status:403});expect(get).toHaveBeenCalledTimes(1);
 });
 it("rejects an installation from another app or a suspended app",async()=>{
  const get=vi.fn().mockResolvedValue(Response.json({installations:[{...install,app_slug:"other"},{...install,id:12,suspended_at:"today"}]}));
  await expect(repositories("token",11,"nodedots-code",get)).rejects.toMatchObject({status:403});
 });
 it("never authorizes a repository just because the user supplied its ID",async()=>{
  const get=vi.fn().mockResolvedValueOnce(Response.json({installations:[install]})).mockResolvedValueOnce(Response.json({repositories:[{id:23}]}));
  await expect(authorizedRepository("token",11,24,"nodedots-code",get)).rejects.toMatchObject({status:403});
 });
 it("uses the user token to verify both installation and repository",async()=>{
  const get=vi.fn().mockResolvedValueOnce(Response.json({installations:[install]})).mockResolvedValueOnce(Response.json({repositories:[{id:23,full_name:"owner/repo"}]}));
  expect(await authorizedRepository("token",11,23,"nodedots-code",get)).toMatchObject({id:23});
  expect(get.mock.calls[0][1].headers.Authorization).toBe("Bearer token");
  expect(get.mock.calls[0][1].headers["User-Agent"]).toBe("NodeDots-Code");
 });
 it("fails closed for revoked credentials",async()=>{
  const get=vi.fn().mockResolvedValue(new Response(null,{status:401}));
  await expect(repositories("token",11,"nodedots-code",get)).rejects.toMatchObject({status:401});
 });
});
