import type { Metadata } from "next";
import type { ISiteSettings } from "@/lib/models";

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    const withProto = envUrl.startsWith("http://") || envUrl.startsWith("https://") ? envUrl : `https://${envUrl}`;
    return withProto.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://nur-company-website.vercel.app";
}

export function toAbsoluteBannerImageUrl(bannerImage?: string): string {
  const raw = (bannerImage || "").trim();
  if (!raw) {
    return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80";
  }
  if (raw.startsWith("data:")) {
    return `${getSiteUrl()}/api/og/banner-image`;
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const siteUrl = getSiteUrl();
  const leadingSlash = raw.startsWith("/") ? "" : "/";
  return `${siteUrl}${leadingSlash}${raw}`;
}

export function toAbsoluteProductImageUrl(
  product?: { slug: string; image?: string } | null,
  fallbackBanner?: string
): string {
  if (!product || !product.image || !product.image.trim()) {
    return fallbackBanner ? toAbsoluteBannerImageUrl(fallbackBanner) : "";
  }
  const raw = product.image.trim();
  if (raw.startsWith("data:")) {
    return `${getSiteUrl()}/api/og/product-image?slug=${encodeURIComponent(product.slug)}`;
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const siteUrl = getSiteUrl();
  const leadingSlash = raw.startsWith("/") ? "" : "/";
  return `${siteUrl}${leadingSlash}${raw}`;
}

export function toAbsoluteImageUrl(
  url?: string,
  options?: { fallback?: string; productSlug?: string; isBanner?: boolean }
): string {
  const raw = (url || "").trim();
  if (!raw) {
    return options?.fallback ? toAbsoluteBannerImageUrl(options.fallback) : "";
  }
  if (raw.startsWith("data:")) {
    if (options?.productSlug) {
      return `${getSiteUrl()}/api/og/product-image?slug=${encodeURIComponent(options.productSlug)}`;
    }
    if (options?.isBanner) {
      return `${getSiteUrl()}/api/og/banner-image`;
    }
    return options?.fallback ? toAbsoluteBannerImageUrl(options.fallback) : "";
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const siteUrl = getSiteUrl();
  const leadingSlash = raw.startsWith("/") ? "" : "/";
  return `${siteUrl}${leadingSlash}${raw}`;
}

export function buildPageMetadata({
  site,
  title,
  description,
  path = "/",
  image,
  keywords,
}: {
  site: ISiteSettings;
  title: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const url = getSiteUrl();
  const canonical = `${url}${path === "/" ? "" : path}`;
  const desc = description || site.seo?.defaultDescription || site.description;
  const finalTitle = path === "/" ? (site.seo?.defaultTitle || site.brandName) : `${title} | ${site.brandName}`;
  const ogImage = toAbsoluteBannerImageUrl(image);

  return {
    title,
    description: desc,
    keywords: keywords?.length ? keywords : site.seo?.keywords || [],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_BD",
      url: canonical,
      siteName: site.brandName,
      title: finalTitle,
      description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: desc,
      images: [ogImage],
    },
  };
}

export function getAnalyticsIds(site?: ISiteSettings | null) {
  return {
    gaId:
      site?.analytics?.gaMeasurementId?.trim() ||
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
      "",
    searchConsole:
      site?.analytics?.googleSiteVerification?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
      "",
  };
}
