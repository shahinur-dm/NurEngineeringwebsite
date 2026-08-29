import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogShell } from "@/components/CatalogShell";
import { Img } from "@/components/Img";
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
  getSettings,
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

  const [categories, related, useCases, siteSettings] = await Promise.all([
    getCategories("product"),
    getRelatedProducts(categoryId, product.slug, 4),
    getUseCases(),
    getSettings(),
  ]);

  const phone = siteSettings?.phone || "+880 1700-000000";
  const cleanPhone = phone.replace(/[^\d]/g, "");

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
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.14em] text-mist">
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
        <span className="text-navy font-semibold truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      <article className="panel p-4 sm:p-5 md:p-8">
        <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10">
          <div className="space-y-4">
            <ProductGallery
              name={product.name}
              images={media.images}
              videoUrl={media.videoUrl}
            />

            <div className="border border-line bg-paper/60 p-3.5 sm:p-4">
              <p className="kicker text-[10px] sm:text-[11px]">At a glance</p>
              <dl className="mt-2.5 sm:mt-3 space-y-0">
                {glance.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[6rem_1fr] sm:grid-cols-[7.5rem_1fr] gap-2 border-b border-line py-1.5 sm:py-2 last:border-0"
                  >
                    <dt className="text-[11.5px] sm:text-[12px] text-mist">{row.label}</dt>
                    <dd className="text-[12.5px] sm:text-[13px] font-medium text-navy break-words">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {extra?.included?.length ? (
              <div className="border border-line p-3.5 sm:p-4">
                <p className="kicker text-[10px] sm:text-[11px]">In the pack</p>
                <ul className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {extra.included.map((item) => (
                    <li
                      key={item}
                      className="border border-line bg-white px-2.5 py-1 text-[11.5px] sm:text-[12px] text-navy"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {extra?.applications?.length ? (
              <div className="border border-line p-3.5 sm:p-4">
                <p className="kicker text-[10px] sm:text-[11px]">Typical use</p>
                <ul className="mt-2.5 sm:mt-3 space-y-2">
                  {extra.applications.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-[11.5px] sm:text-[12px] leading-5 text-steel"
                    >
                      <span className="mt-[7px] h-px w-3 shrink-0 bg-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border border-line p-3.5 sm:p-4">
              <p className="kicker text-[10px] sm:text-[11px]">Before you order</p>
              <ul className="mt-2.5 sm:mt-3 space-y-2">
                {orderNotes.map((note) => (
                  <li
                    key={note}
                    className="flex gap-2 text-[11.5px] sm:text-[12px] leading-5 text-steel"
                  >
                    <span className="mt-[7px] h-px w-3 shrink-0 bg-orange" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-navy px-4 py-3.5 text-white">
              <div>
                <p className="font-display text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.12em]">
                  Need a match?
                </p>
                <p className="mt-0.5 text-[10.5px] sm:text-[11px] text-white/60">
                  Photo + nameplate is enough to quote.
                </p>
              </div>
              <Link
                href={`/contact?product=${product.slug}`}
                className="btn-orange shrink-0 px-4 text-xs font-bold"
              >
                Quote
              </Link>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <p className="kicker text-[10px] sm:text-[11px]">{categoryName}</p>
              <span className="stock-pill text-[9.5px] sm:text-[10.5px]">
                {product.inStock ? "Available" : "Made to order"}
              </span>
            </div>
            <h1 className="mt-2.5 sm:mt-3 font-display text-[clamp(1.4rem,3vw,2.35rem)] font-bold uppercase leading-[1.05] tracking-[0.03em] text-navy">
              {product.name}
            </h1>
            <p className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-sm leading-relaxed sm:leading-7 text-steel">
              {product.shortDescription}
            </p>

            <div className="mt-5 sm:mt-6 border-y border-line py-4 sm:py-5">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Link
                  href={`/contact?product=${product.slug}`}
                  className="btn-orange inline-flex items-center justify-center gap-2 flex-1 sm:flex-none text-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-none stroke-current"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Ask Price</span>
                </Link>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello, I want to ask the price for ${product.name} (SKU: ${product.sku || product.slug}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 bg-[#1ea952] px-5 py-2.5 font-display text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#188c43] shadow-sm flex-1 sm:flex-none text-center"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
              <p className="mt-2.5 sm:mt-3 text-[11.5px] sm:text-[12px] leading-5 text-mist">
                Indicative price. Confirm variant, coil voltage, I/O type and stock on quote.
              </p>
            </div>

            <dl className="mt-5 sm:mt-6">
              {facts.map(([label, value], i) => (
                <div
                  key={label}
                  className={`grid grid-cols-[6.5rem_1fr] sm:grid-cols-[9rem_1fr] gap-2 sm:gap-3 px-0 py-2 sm:py-2.5 text-xs sm:text-[13px] ${
                    i < facts.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <dt className="tracking-wide text-mist">{label}</dt>
                  <dd className="font-medium text-navy break-words">{value}</dd>
                </div>
              ))}
            </dl>

            {categorySlug && (
              <div className="mt-6 sm:mt-7">
                <Link href={`/products?category=${categorySlug}`} className="btn-navy w-full sm:w-auto text-center">
                  More in {categoryName}
                </Link>
              </div>
            )}
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

      {related.length > 0 && (
        <section className="panel p-5 md:p-8">
          <h2 className="section-label">Related products</h2>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
            {related.map((item) => {
              const catName =
                typeof item.category === "object"
                  ? item.category?.name
                  : "";
              return (
                <Link
                  key={String(item._id)}
                  href={`/products/${item.slug}`}
                  className="group flex flex-col justify-between border border-line bg-white p-3.5 transition hover:border-orange/60 hover:shadow-sm"
                >
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden border border-line/50 bg-paper/20">
                      <Img
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2 transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px"
                      />
                    </div>
                    <div className="mt-3">
                      {catName && (
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-mist">
                          {catName}
                        </p>
                      )}
                      <h3 className="mt-1 font-display text-[13px] font-bold uppercase leading-snug tracking-wide text-navy transition group-hover:text-orange line-clamp-2">
                        {item.name}
                      </h3>
                      {item.shortDescription && (
                        <p className="mt-1 line-clamp-2 text-[11.5px] leading-4 text-steel">
                          {item.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
    </CatalogShell>
  );
}
