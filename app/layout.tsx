import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Localhost Global — Travel Back Home.",
  description:
    "A high-end local-host travel network connecting thoughtful travelers with trusted hosts, private routes, and seamless local support, starting with China.",
  openGraph: {
    title: "Localhost Global — Travel Back Home.",
    description:
      "A global local-host network for thoughtful travelers, starting with China."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
