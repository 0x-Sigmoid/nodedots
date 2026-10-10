import type {ReactNode} from "react";
import {Header} from "@/components/navigation/header";
import {Footer} from "@/components/navigation/footer";
import {DocNavigation} from "@/components/doc-navigation";
export default function DocLayout({children}:{children:ReactNode}){return <div className="wl-page clarity-page"><Header/><div className="doc-layout"><DocNavigation/><main id="main" className="doc-main">{children}</main></div><Footer/></div>;}
