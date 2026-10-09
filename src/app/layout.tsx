import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./marketing.css";
import "./waitlist/waitlist.css";
import "./analysis-demo.css";
import "./clarity.css";
import "./navigation.css";
import { clarityDescription, clarityTitle } from "@/lib/marketing-copy";
import { pageMetadata, siteUrl } from "@/lib/site-metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...pageMetadata("/", clarityTitle, clarityDescription, undefined, "NodeDots — Connect the dots. Before you ship."),
  title: {
    default: clarityTitle,
    template: "%s | NodeDots",
  },
  description:
    clarityDescription,
  applicationName: "NodeDots",
  metadataBase: new URL(siteUrl),
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  alternates: {
    canonical: "/",
  },
  keywords: [
    "NodeDots",
    "NodeDots Code",
    "pull request review",
    "change impact analysis",
    "missing tests",
    "API contract drift",
    "AI code verification",
    "GitHub pull requests",
  ],
  icons: {
    icon: [{ url: "/favicon.svg?v=nodedots-20261009", type: "image/svg+xml", sizes: "any" }, { url: "/brand/favicon-32.png?v=nodedots-20261009", type: "image/png", sizes: "32x32" }, { url: "/brand/favicon-16.png?v=nodedots-20261009", type: "image/png", sizes: "16x16" }],
    shortcut: "/favicon.ico?v=nodedots-20261009",
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  category: "technology",
};

export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fbfafd" }, { media: "(prefers-color-scheme: dark)", color: "#1a1030" }] };

const themeInit = `(function(){document.documentElement.classList.add('js');var t;try{t=localStorage.getItem('nodedots-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',t==='dark')})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/markdown" href="/product-facts.md" title="NodeDots public product facts" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
