import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Page not found | Localhost Global",
  description: "This page is not available. Explore the current China routes.",
  robots: { index: false, follow: true },
  openGraph: null,
  twitter: null
};

export default function NotFound() {
  return (
    <>
      <SiteHeader discovery />
      <main id="main-content" tabIndex={-1}>
        <section className="section section--stone">
          <div className="section-heading">
            <p className="eyebrow">404</p>
            <h1>Page not found.</h1>
            <p>This address is not available. The current China routes are still here to explore.</p>
          </div>
          <div className="inline-actions">
            <Link href="/journeys" className="button button--dark">Explore China Routes</Link>
            <Link href="/" className="text-link">Return home</Link>
          </div>
        </section>
      </main>
      <SiteFooter discovery />
    </>
  );
}
