import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Localhost Global — Private China Routes",
  description:
    "A quiet local-host travel network connecting travelers with trusted hosts, private routes, cultural fluency, and practical confidence, starting with China.",
  openGraph: {
    title: "Localhost Global — Private China Routes",
    description:
      "A private local-host network for travelers who want China routes shaped with local judgment."
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
