import {describe,it,expect} from "vitest";
import {seal,unseal,randomToken,pkceChallenge,validMutation,validSelection} from "./security";
const secret="test-only-key-32-characters-minimum-123";
describe("account boundary",()=>{
 it("encrypts tokens and rejects tampering and a different key",()=>{
  const token="ghu_private_test_token";const encrypted=seal(token,secret);
  expect(encrypted).not.toContain(token);expect(unseal(encrypted,secret)).toBe(token);
  expect(unseal(encrypted.slice(0,-5)+"AAAAA",secret)).toBeNull();
  expect(unseal(encrypted,"another-key-32-characters-minimum-456")).toBeNull();
 });
 it("rejects missing keys and malformed encrypted values",()=>{expect(()=>seal("secret","short")).toThrow();expect(unseal("malformed",secret)).toBeNull();});
 it("creates high entropy OAuth state and valid PKCE challenge",()=>{const state=randomToken();expect(state).toHaveLength(43);expect(randomToken()).not.toBe(state);expect(pkceChallenge(state)).toHaveLength(43);});
 it("rejects cross-origin mutations",()=>{expect(validMutation(new Request("https://nodedots.com/api",{headers:{origin:"https://evil.test"}}),"https://nodedots.com")).toBe(false);expect(validMutation(new Request("https://nodedots.com/api",{headers:{origin:"https://nodedots.com"}}),"https://nodedots.com")).toBe(true);});
 it("accepts only positive numeric repository identifiers",()=>{expect(validSelection({installation:1,repository:2,pull:3})).toBe(true);expect(validSelection({installation:"1",repository:2,pull:3})).toBe(false);expect(validSelection({installation:1,repository:-2,pull:3})).toBe(false);});
});
