import type {ReactNode} from "react";
import {Mark,ThemeToggle} from "./site-header";
export function AccountShell({children,login}:{children:ReactNode;login?:string}) {
 return <div className="wl-page account-page"><header className="account-header"><a className="brand" href="/"><Mark /><span>NodeDots</span></a><div><ThemeToggle />{login&&<><span className="account-login">@{login}</span><form action="/api/account/logout" method="post"><button type="submit" className="account-text-link">Sign out</button></form></>}</div></header><main className="account-main" id="main">{children}</main><footer className="account-footer"><a href="/privacy">Privacy</a><a href="https://github.com/0x-Sigmoid/nodedots/tree/main/docs">Documentation</a><a href="/">Back to NodeDots</a></footer></div>;
}
