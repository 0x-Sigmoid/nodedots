import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NodeDots — Connect the dots before you act",
    template: "%s | NodeDots",
  },
  description:
    "NodeDots Code reads your pull request against the whole repo and shows what it touched, what it missed, and what now conflicts. Join the early-access waitlist.",
  applicationName: "NodeDots",
  metadataBase: new URL("https://nodedots.com"),
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
  openGraph: {
    title: "NodeDots — Connect the dots. Before you ship.",
    description: "Read your change against the whole repo. NodeDots Code · Early access.",
    url: "/",
    siteName: "NodeDots",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NodeDots — Connect the dots. Before you ship.",
    description: "Read your change against the whole repo.",
  },
  category: "technology",
};

const themeInit = `(function(){document.documentElement.classList.add('js');var t;try{t=localStorage.getItem('nodedots-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.classList.toggle('dark',t==='dark')})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
