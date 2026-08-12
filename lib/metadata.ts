import type { Metadata } from "next";

export const localhostSiteUrl = "https://localhostchinav1.vercel.app";

const defaultDescription =
  "Private China routes shaped with local judgment, selected hosts, and practical support. Every inquiry is reviewed by a person before any route is confirmed.";
const defaultImage = "/images/temple-of-heaven-centered-hero.png";
const defaultImageAlt =
  "The Temple of Heaven in quiet morning light, centered against a spacious sky.";

export const localhostBaseMetadata: Metadata = {
  applicationName: "Localhost Global",
  metadataBase: new URL(localhostSiteUrl),
  title: "Localhost Global — Private China Routes",
  description: defaultDescription,
  formatDetection: {
    address: false,
    email: false,
    telephone: false
  },
  openGraph: {
    title: "Enter China With Local Judgment.",
    description: defaultDescription,
    siteName: "Localhost Global",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: defaultImage,
        width: 1672,
        height: 941,
        alt: defaultImageAlt
      }
    ]
  },
  robots: {
    index: true,
    follow: true
  },
  twitter: {
    card: "summary_large_image",
    title: "Enter China With Local Judgment.",
    description: defaultDescription,
    images: [defaultImage]
  }
};

type LocalhostPageMetadata = {
  description: string;
  image?: string;
  imageAlt?: string;
  path: string;
  shareTitle?: string;
  title: string;
};

export function buildLocalhostPageMetadata({
  description,
  image = defaultImage,
  imageAlt = defaultImageAlt,
  path,
  shareTitle,
  title
}: LocalhostPageMetadata): Metadata {
  const socialTitle = shareTitle || title;

  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: "Localhost Global",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: image,
          width: 1672,
          height: 941,
          alt: imageAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image]
    }
  };
}
