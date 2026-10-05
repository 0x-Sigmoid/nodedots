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
    default: "NodeDots | Tools for trust, clarity, and AI decisions",
    template: "%s | NodeDots",
  },
  description:
    "NodeDots is an independent product studio building small tools for trust, clarity, and AI-assisted decisions.",
  applicationName: "NodeDots",
  authors: [{ name: "@nodedots", url: "https://x.com/nodedots" }],
  creator: "@nodedots",
  publisher: "@nodedots",
  metadataBase: new URL("https://nodedots.com"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "NodeDots",
    "@nodedots",
    "independent developer",
    "web product developer",
    "VennURL",
    "Tabmeet",
    "link trust",
    "browser decisions",
    "AI tools",
    "trust and clarity",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/nodedots.png", type: "image/png" },
    ],
    apple: [{ url: "/nodedots.png", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "@nodedots | Tools for Trust, Clarity, and AI Decisions",
    description:
      "Simple tools that explain first, then invite action.",
    url: "/",
    siteName: "NodeDots",
    images: [
      {
        url: "/nodedots.png",
        width: 1254,
        height: 1254,
        alt: "NodeDots logo mark",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "@nodedots | Tools for Trust, Clarity, and AI Decisions",
    description:
      "Simple tools for trust, clarity, and AI decisions.",
    creator: "@nodedots",
    images: ["/nodedots.png"],
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
