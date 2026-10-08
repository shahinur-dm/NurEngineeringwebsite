import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SiteProvider } from "@/components/SiteProvider";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { getAnalyticsIds, getSiteUrl, toAbsoluteBannerImageUrl } from "@/lib/seo";
import { getBanners, getSettings, getUseCases } from "@/lib/data";

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a2540",
};

export async function generateMetadata(): Promise<Metadata> {
  const [site, banners] = await Promise.all([getSettings(), getBanners()]);
  const url = getSiteUrl();
  const { searchConsole } = getAnalyticsIds(site);

  const firstBanner =
    banners[0]?.image?.trim() ||
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80";
  const ogImageUrl = toAbsoluteBannerImageUrl(firstBanner);

  const title = site.seo?.defaultTitle || site.brandName;
  const description = site.seo?.defaultDescription || site.description;

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s | ${site.brandName}`,
    },
    description,
    keywords: site.seo?.keywords || [],
    applicationName: site.brandName,
    icons: site.favicon
      ? {
          icon: site.favicon,
          shortcut: site.favicon,
          apple: site.favicon,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en_BD",
      url,
      siteName: site.brandName,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    ...(searchConsole ? { verification: { google: searchConsole } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, useCases] = await Promise.all([getSettings(), getUseCases()]);
  const { gaId } = getAnalyticsIds(settings);

  return (
    <html lang="en-BD" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        <SiteProvider settings={settings} useCases={useCases}>
          <JsonLd />
          <Analytics gaId={gaId} />
          <TopBar />
          <Suspense fallback={<div className="h-11 bg-navy" />}>
            <NavBar />
          </Suspense>
          <main id="main-content">{children}</main>
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
