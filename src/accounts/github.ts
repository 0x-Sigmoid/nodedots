export class AccountError extends Error {
 constructor(public status:number, message:string) { super(message); }
}
export async function github<T>(token:string,path:string, get:typeof fetch=fetch):Promise<T> {
 const response = await get(`https://api.github.com${path}`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2026-03-10"},cache:"no-store",signal:AbortSignal.timeout(15000)});
 if (!response.ok) throw new AccountError(response.status === 401 ? 401 : response.status === 404 ? 403 : 502, response.status === 401 ? "Your GitHub session has expired. Sign in again." : "GitHub access could not be verified. Reconnect or try again.");
 return response.json() as Promise<T>;
}
export type Installation = {id:number;account:{login:string};suspended_at:string|null;app_slug:string};
export type Repository = {id:number;name:string;full_name:string;private:boolean;owner:{login:string}};
export async function installations(token:string,slug:string,get:typeof fetch=fetch) {
 const result = await github<{installations:Installation[]}>(token,"/user/installations?per_page=100",get);
 return result.installations.filter(item=>item.app_slug===slug && !item.suspended_at);
}
export async function repositories(token:string,installation:number,slug:string,get:typeof fetch=fetch) {
 const allowed = await installations(token,slug,get);
 if (!allowed.some(item=>item.id===installation)) throw new AccountError(403,"This GitHub installation is not available to your account.");
 // Paginate the verified installation rather than accepting a client-supplied repository path.
 const rows:Repository[]=[];
 for(let page=1;page<=20;page++) {
  const result = await github<{repositories:Repository[]}>(token,`/user/installations/${installation}/repositories?per_page=100&page=${page}`,get);
  rows.push(...result.repositories);
  if(result.repositories.length<100) break;
 }
 return rows;
}
export async function authorizedRepository(token:string,installation:number,repoId:number,slug:string,get:typeof fetch=fetch) {
 const repo = (await repositories(token,installation,slug,get)).find(item=>item.id===repoId);
 if (!repo) throw new AccountError(403,"This repository is not connected to your account.");
 return repo;
}
