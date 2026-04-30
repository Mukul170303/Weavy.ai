import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "Weavy AI",
  icons: {
    icon: [
      {
        url: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/69d4f1efa9dc89ccca92be1a_logo%20-%20squeare%20Weavy%20W.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/69d4f1efa9dc89ccca92be1a_logo%20-%20squeare%20Weavy%20W.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
