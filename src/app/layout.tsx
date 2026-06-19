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
    default: "NodeDots | Developer Portfolio for Thoughtful Web Products",
    template: "%s | NodeDots",
  },
  description:
    "NodeDots is the developer portfolio of a product builder creating thoughtful web products around learning, clarity, trust, and practical user experience.",
  applicationName: "NodeDots",
  authors: [{ name: "NodeDots", url: "https://x.com/nodedots" }],
  creator: "NodeDots",
  publisher: "NodeDots",
  metadataBase: new URL("https://nodedots.com"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "NodeDots",
    "NodeDots developer",
    "web product developer",
    "product builder",
    "VennURL",
    "Tabmeet",
    "Accentta",
    "UX portfolio",
    "trust-first products",
    "practical user experience",
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
    title: "NodeDots | Developer Portfolio",
    description:
      "Thoughtful web products for learning, clarity, and trust. Explore NodeDots products, notes, booking, and live updates.",
    url: "/",
    siteName: "NodeDots",
    images: [
      {
        url: "/nodedots.png",
        width: 1254,
        height: 1254,
        alt: "NodeDots developer profile image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NodeDots | Developer Portfolio",
    description:
      "Thoughtful web products for learning, clarity, and trust.",
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
