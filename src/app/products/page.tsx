import type { Metadata } from "next";
import { CatalogShell } from "@/components/CatalogShell";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const site = await getSettings();
  const title = sp.q
    ? `Search: ${sp.q}`
    : sp.category
      ? sp.category.replace(/-/g, " ")
      : "Products";
  return buildPageMetadata({
    site,
    title,
    description: "Industrial machine parts catalog — PLC, motors, VFD, sensors and spares.",
    path: "/products",
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories("product"),
    getProducts({ categorySlug: sp.category, q: sp.q }),
  ]);

  const active = categories.find((c) => c.slug === sp.category);
  const heading = sp.q
    ? `Search results for “${sp.q}”`
    : active
      ? active.name
      : "All products";

  return (
    <CatalogShell categories={categories} activeSlug={sp.category}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="section-label">{heading}</div>
          {active?.description && (
            <p className="-mt-2 mb-1 max-w-2xl text-sm leading-6 text-steel">
              {active.description}
            </p>
          )}
        </div>
        <p className="pb-1 font-display text-[12px] uppercase tracking-[0.16em] text-mist">
          {String(products.length).padStart(2, "0")} items
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={String(product._id)} product={product} />
        ))}
      </div>
      {!products.length && (
        <p className="border border-line bg-white p-8 text-sm text-steel">
          No parts matched this search. Try another name, SKU, or category — or send us a photo on the contact page.
        </p>
      )}
    </CatalogShell>
  );
}
