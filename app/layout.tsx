import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Localhost Global — Travel Back Home.",
  description:
    "A quiet local-host travel network connecting travelers with trusted hosts, private routes, cultural fluency, and practical confidence, starting with China.",
  openGraph: {
    title: "Localhost Global — Travel Back Home.",
    description:
      "A private local-host network for travelers who want a local way in, starting with China."
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
