import type { MetadataRoute } from "next";
import { getProducts, getServices, getUseCases, getBlogPosts } from "@/lib/data";
import { getSiteUrl } from "@/lib/seo";

function cleanUrlPath(slug?: string): string {
  if (!slug) return "";
  const trimmed = slug.trim();
  return encodeURI(trimmed);
}

function getItemDate(item: unknown, fallback: Date): Date {
  if (item && typeof item === "object" && "updatedAt" in item && (item as { updatedAt?: unknown }).updatedAt) {
    const d = new Date((item as { updatedAt: string | number | Date }).updatedAt);
    if (!isNaN(d.getTime())) return d;
  }
  return fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${base}/products`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${base}/services`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/use-cases`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/about`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/contact`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/catalogue`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/user-manual`, priority: 0.7, changeFrequency: "monthly" as const },
  ].map((entry) => ({
    ...entry,
    lastModified: now,
  }));

  try {
    const [products, services, useCases, blogPosts] = await Promise.all([
      getProducts(),
      getServices(),
      getUseCases(),
      getBlogPosts().catch(() => []),
    ]);

    const productEntries: MetadataRoute.Sitemap = products
      .filter((p) => Boolean(p?.slug))
      .map((p) => ({
        url: `${base}/products/${cleanUrlPath(p.slug)}`,
        lastModified: getItemDate(p, now),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    const serviceEntries: MetadataRoute.Sitemap = services
      .filter((s) => Boolean(s?.slug))
      .map((s) => ({
        url: `${base}/services/${cleanUrlPath(s.slug)}`,
        lastModified: getItemDate(s, now),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      }));

    const useCaseEntries: MetadataRoute.Sitemap = useCases
      .filter((item) => Boolean(item?.slug))
      .map((item) => ({
        url: `${base}/use-cases/${cleanUrlPath(item.slug)}`,
        lastModified: getItemDate(item, now),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      }));

    const blogEntries: MetadataRoute.Sitemap = (blogPosts || [])
      .filter((post) => Boolean(post?.slug))
      .map((post) => ({
        url: `${base}/blog/${cleanUrlPath(post.slug)}`,
        lastModified: getItemDate(post, now),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

    return [
      ...staticEntries,
      ...serviceEntries,
      ...useCaseEntries,
      ...productEntries,
      ...blogEntries,
    ];
  } catch {
    return staticEntries;
  }
}
