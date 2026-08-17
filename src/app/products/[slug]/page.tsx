import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogShell } from "@/components/CatalogShell";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { formatPrice } from "@/lib/format";
import { getProductDetail } from "@/lib/product-details";
import { getProductMedia } from "@/lib/product-media";
import {
  getCategories,
  getProductBySlug,
  getRelatedProducts,
  getUseCases,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const extra = getProductDetail(product.slug);
  const categoryId =
    typeof product.category === "object"
      ? String(product.category._id)
      : String(product.category);
  const categorySlug =
    typeof product.category === "object" ? product.category.slug : undefined;
  const categoryName =
    typeof product.category === "object" ? product.category.name : "";

  const [categories, related, useCases] = await Promise.all([
    getCategories("product"),
    getRelatedProducts(categoryId, product.slug, 4),
    getUseCases(),
  ]);

  const linkedUseCases = extra
    ? useCases.filter((item) => extra.relatedUseCaseSlugs.includes(item.slug))
    : [];

  const media = getProductMedia(
    product.image,
    categorySlug,
    product.gallery,
  );

  const facts = [
    ["SKU", product.sku || "On quote"],
    ["Brand / class", product.brand || "As quoted"],
    ["Category", categoryName || "—"],
    ["Availability", product.inStock ? "In stock — confirm lead time" : "Made to order"],
    ["Condition", extra?.condition || "New / equivalent as quoted"],
    ["Packing", extra?.packing || "Industrial packing"],
    ["Warranty", extra?.warranty || "As stated on quotation"],
    ["Currency", product.currency || "BDT"],
  ];

  const glance =
    extra?.specTable?.slice(0, 4) ??
    facts.slice(0, 4).map(([label, value]) => ({ label, value }));

  const orderNotes = extra?.notes?.slice(0, 3) ?? [
    "Confirm voltage, I/O type and mounting from the nameplate.",
    "A photo of the existing part is enough to quote an equivalent.",
    "Stock, packing and warranty are confirmed on the quotation.",
  ];

  return (
    <CatalogShell categories={categories} activeSlug={categorySlug}>
      <nav className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-mist">
        <Link href="/products" className="transition hover:text-orange">
          Products
        </Link>
        {categorySlug && (
          <>
            <span className="text-line">/</span>
            <Link
              href={`/products?category=${categorySlug}`}
              className="transition hover:text-orange"
            >
              {categoryName}
            </Link>
          </>
        )}
        <span className="text-line">/</span>
        <span className="text-navy">{product.name}</span>
      </nav>

      <article className="panel p-5 md:p-8">
        <div className="grid items-start gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10">
          <div className="space-y-4">
            <ProductGallery
              name={product.name}
              images={media.images}
              videoUrl={media.videoUrl}
            />

            <div className="border border-line bg-paper/60 p-4">
              <p className="kicker">At a glance</p>
              <dl className="mt-3 space-y-0">
                {glance.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[7.5rem_1fr] gap-2 border-b border-line py-2 last:border-0"
                  >
                    <dt className="text-[12px] text-mist">{row.label}</dt>
                    <dd className="text-[13px] font-medium text-navy">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {extra?.included?.length ? (
              <div className="border border-line p-4">
                <p className="kicker">In the pack</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {extra.included.map((item) => (
                    <li
                      key={item}
                      className="border border-line bg-white px-2.5 py-1 text-[12px] text-navy"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {extra?.applications?.length ? (
              <div className="border border-line p-4">
                <p className="kicker">Typical use</p>
                <ul className="mt-3 space-y-2">
                  {extra.applications.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[12px] leading-5 text-steel"
                    >
                      <span className="mt-[7px] h-px w-3 shrink-0 bg-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border border-line p-4">
              <p className="kicker">Before you order</p>
              <ul className="mt-3 space-y-2.5">
                {orderNotes.map((note) => (
                  <li
                    key={note}
                    className="flex gap-2.5 text-[12px] leading-5 text-steel"
                  >
                    <span className="mt-[7px] h-px w-3 shrink-0 bg-orange" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-3 border border-line bg-navy px-4 py-3.5 text-white">
              <div>
                <p className="font-display text-[13px] font-bold uppercase tracking-[0.12em]">
                  Need a match?
                </p>
                <p className="mt-0.5 text-[11px] text-white/60">
                  Photo + nameplate is enough to quote.
                </p>
              </div>
              <Link
                href={`/contact?product=${product.slug}`}
                className="btn-orange shrink-0 px-4"
              >
                Quote
              </Link>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-3">
              <p className="kicker">{categoryName}</p>
              <span className="stock-pill">
                {product.inStock ? "Available" : "Made to order"}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[clamp(1.7rem,3vw,2.35rem)] font-bold uppercase leading-[0.95] tracking-[0.03em] text-navy">
              {product.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-steel">
              {product.shortDescription}
            </p>

            <div className="mt-6 border-y border-line py-5">
              <p className="font-display text-[2rem] font-bold leading-none tracking-wide text-navy">
                {formatPrice(product.price, product.currency)}
              </p>
              <p className="mt-2 text-[12px] leading-5 text-mist">
                Indicative price. Confirm variant, coil voltage, I/O type and stock on quote.
              </p>
            </div>

            <dl className="mt-6">
              {facts.map(([label, value], i) => (
                <div
                  key={label}
                  className={`grid grid-cols-[9rem_1fr] gap-3 px-0 py-2.5 text-[13px] ${
                    i < facts.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <dt className="tracking-wide text-mist">{label}</dt>
                  <dd className="font-medium text-navy">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/contact?product=${product.slug}`} className="btn-orange">
                Request quote
              </Link>
              {categorySlug && (
                <Link href={`/products?category=${categorySlug}`} className="btn-navy">
                  More in {categoryName}
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>

      <section className="panel p-5 md:p-8">
        <h2 className="section-label">Product overview</h2>
        <p className="max-w-3xl text-sm leading-7 text-steel">
          {extra?.overview || product.description}
        </p>
        {extra?.features?.length ? (
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {extra.features.map((item) => (
              <li
                key={item}
                className="flex gap-3 border border-line bg-paper/70 px-4 py-3 text-[13px] leading-6 text-ink"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-orange" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {(extra?.specTable?.length || product.specs?.length) && (
        <section className="panel overflow-hidden p-5 md:p-8">
          <h2 className="section-label">Technical specifications</h2>
          {extra?.specTable?.length ? (
            <div className="overflow-x-auto border border-line">
              <table className="spec-table min-w-[28rem]">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {extra.specTable.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className="font-medium text-navy">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <li key={spec} className="border border-line bg-paper px-3 py-2 text-sm">
                  {spec}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {extra?.applications?.length ? (
        <section className="panel p-5 md:p-8">
          <h2 className="section-label">Typical applications</h2>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {extra.applications.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-steel">
                <span className="mt-[9px] h-px w-4 shrink-0 bg-orange" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {extra?.notes?.length || extra?.included?.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {extra?.included?.length ? (
            <section className="panel p-5 md:p-8">
              <h2 className="section-label">What you get</h2>
              <ul className="space-y-3 text-sm leading-6 text-steel">
                {extra.included.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[9px] h-px w-4 shrink-0 bg-orange" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {extra?.notes?.length ? (
            <section className="panel p-5 md:p-8">
              <h2 className="section-label">Selection notes</h2>
              <ul className="space-y-4 text-sm leading-6 text-steel">
                {extra.notes.map((item, i) => (
                  <li key={item} className="flex gap-3">
                    <span className="font-display text-sm font-bold text-orange/70">
                      0{i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {extra?.sendUs?.length ? (
        <section className="relative overflow-hidden bg-navy p-6 text-white md:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 bg-orange/15 blur-3xl" />
          <p className="kicker text-orange-bright">Quotation</p>
          <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-[0.04em]">
            What to send for a correct quote
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Variants differ by coil voltage, NPN/PNP, frame and I/O. A photo
            beats a guess.
          </p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {extra.sendUs.map((item) => (
              <li
                key={item}
                className="border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-6"
              >
                {item}
              </li>
            ))}
          </ul>
          <Link href={`/contact?product=${product.slug}`} className="btn-orange mt-7 inline-flex">
            Send details
          </Link>
        </section>
      ) : null}

      {product.relatedServices?.length > 0 && (
        <section>
          <div className="section-label">Related technical services</div>
          <div className="flex flex-wrap gap-2">
            {product.relatedServices.map((service) =>
              service?.slug ? (
                <Link
                  key={String(service._id)}
                  href={`/services/${service.slug}`}
                  className="border border-line bg-white px-4 py-2.5 text-[13px] text-navy transition hover:border-orange hover:text-orange"
                >
                  {service.title}
                </Link>
              ) : null
            )}
          </div>
        </section>
      )}

      {linkedUseCases.length > 0 && (
        <section>
          <div className="section-label">Where this part is used</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {linkedUseCases.map((item) => (
              <Link key={item.slug} href={`/use-cases/${item.slug}`} className="catalog-card p-5">
                <p className="kicker">{item.industry}</p>
                <p className="mt-2 font-display text-[15px] font-bold uppercase tracking-wide text-navy">
                  {item.title}
                </p>
                <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-steel">
                  {item.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <div className="section-label">Related parts</div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={String(item._id)} product={item} size="sm" />
            ))}
          </div>
        </section>
      )}
    </CatalogShell>
  );
}
