import type { Metadata } from "next";
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
        <LocalhostAnalytics />
      </body>
    </html>
  );
}
