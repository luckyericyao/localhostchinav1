import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { LocalhostAnalytics } from "@/components/LocalhostAnalytics";
import { localhostBaseMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = localhostBaseMetadata;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <LocalhostAnalytics />
      </body>
    </html>
  );
}
