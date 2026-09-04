import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogShell } from "@/components/CatalogShell";
import { Img } from "@/components/Img";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductTabs } from "@/components/ProductTabs";
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
export const revalidate = 0;

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
    typeof product.category === "object" ? product.category.name : "Category";

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
    product.videoUrl
  );

  const facts = [
    ["SKU", product.sku || "On quote"],
    ["Brand / class", product.brand || "As quoted"],
    ["Category", categoryName || "—"],
    [
      "Availability",
      product.availabilityText ||
        (product.inStock ? "In stock – confirm lead time" : "Made to order"),
    ],
    ["Condition", product.condition || extra?.condition || "New / equivalent as quoted"],
    ["Packing", product.packing || extra?.packing || "Carton"],
    ["Warranty", product.warranty || extra?.warranty || "As quoted"],
    ["Currency", product.currency || "BDT"],
  ];

  return (
    <CatalogShell categories={categories} activeSlug={categorySlug}>
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11.5px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.14em] text-mist">
        <Link href="/" className="transition hover:text-orange">
          Home
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
        <span className="text-navy font-bold truncate max-w-[240px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Details Card */}
      <article className="panel mt-3 p-4 sm:p-5 md:p-8 bg-white border border-line">
        <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-[1.05fr_1.15fr] lg:gap-10">
          {/* Left Side: Image / Video Gallery */}
          <div className="w-full">
            <ProductGallery
              name={product.name}
              images={media.images}
              videoUrl={media.videoUrl}
            />
          </div>

          {/* Right Side: Product Information */}
          <div className="flex flex-col">
            {/* Category & Availability Status */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-xs sm:text-[13px] font-bold uppercase tracking-wider text-orange">
                {categoryName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7ed] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#1ea952]">
                <span className="h-2 w-2 rounded-full bg-[#1ea952]" />
                {product.availabilityText || (product.inStock ? "Available" : "Made to order")}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="mt-2.5 sm:mt-3 font-display text-[1.45rem] sm:text-2xl lg:text-[1.85rem] font-bold uppercase leading-tight tracking-wide text-navy">
              {product.name}
            </h1>

            {/* Short Description */}
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-steel">
              {product.shortDescription}
            </p>

            {/* Action Buttons: Ask Price & WhatsApp */}
            <div className="mt-5 sm:mt-6 border-t border-line pt-4 sm:pt-5">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Link
                  href={`/contact?product=${product.slug}`}
                  className="btn-orange inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 font-display text-xs font-bold uppercase tracking-wider flex-1 sm:flex-none text-center shadow-xs"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-none stroke-current"
                    strokeWidth="2.2"
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
                  className="inline-flex items-center justify-center gap-2 bg-[#1ea952] hover:bg-[#188c43] px-5 sm:px-6 py-2.5 sm:py-3 font-display text-xs font-bold uppercase tracking-wider text-white shadow-xs flex-1 sm:flex-none text-center transition"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
              <p className="mt-2.5 sm:mt-3 text-[11.5px] sm:text-xs leading-5 text-mist">
                Indicative price. Confirm variant, coil voltage, I/O type and stock on quote.
              </p>
            </div>

            {/* Specifications / Attribute Table */}
            <dl className="mt-5 border-t border-line divide-y divide-line">
              {facts.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[7rem_1fr] sm:grid-cols-[9.5rem_1fr] gap-2 py-2 text-xs sm:text-[13px]"
                >
                  <dt className="text-mist font-normal">{label}</dt>
                  <dd className="font-semibold text-navy break-words">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Trust & Service Information Badges */}
            <div className="mt-5 pt-4 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div className="flex items-center gap-2 text-xs sm:text-[12.5px] font-semibold text-navy">
                <svg
                  className="h-4.5 w-4.5 shrink-0 text-[#1ea952]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>100% genuine, authorised stock</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-[12.5px] font-semibold text-navy">
                <svg
                  className="h-4.5 w-4.5 shrink-0 text-[#1ea952]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>12-month manufacturer warranty</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-[12.5px] font-semibold text-navy">
                <svg
                  className="h-4.5 w-4.5 shrink-0 text-[#1ea952]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Nationwide delivery in 2-4 days</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-[12.5px] font-semibold text-navy">
                <svg
                  className="h-4.5 w-4.5 shrink-0 text-[#1ea952]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <circle cx="8" cy="15" r="1.5" />
                </svg>
                <span>Cash on delivery available</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Description / Specifications / Warranty & Returns Tab Section */}
      <ProductTabs
        description={product.description || extra?.overview || ""}
        features={extra?.features || []}
        specTable={
          product.specTable && product.specTable.length > 0
            ? product.specTable
            : extra?.specTable || null
        }
        specsList={product.specs || []}
        warranty={product.warranty || extra?.warranty || ""}
        warrantyAndReturns={product.warrantyAndReturns || ""}
        condition={product.condition || extra?.condition || ""}
        packing={product.packing || extra?.packing || ""}
      />

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="panel mt-6 sm:mt-8 p-4 sm:p-5 md:p-8">
          <h2 className="section-label">Related products</h2>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
            {related.map((item) => {
              const catName =
                typeof item.category === "object" ? item.category?.name : "";
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

      {/* Related Technical Services Section */}
      {product.relatedServices && product.relatedServices.length > 0 && (
        <section className="panel mt-6 sm:mt-8 p-4 sm:p-5 md:p-8">
          <div className="section-label">Related technical services</div>
          <div className="flex flex-wrap gap-2.5">
            {product.relatedServices.map((service) =>
              service?.slug ? (
                <Link
                  key={String(service._id)}
                  href={`/services/${service.slug}`}
                  className="border border-line bg-white px-4 py-2.5 text-[12.5px] font-semibold text-navy transition hover:border-orange hover:text-orange"
                >
                  {service.title}
                </Link>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Where This Part is Used Section */}
      {linkedUseCases.length > 0 && (
        <section className="panel mt-6 sm:mt-8 p-4 sm:p-5 md:p-8">
          <div className="section-label">Where this part is used</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {linkedUseCases.map((item) => (
              <Link
                key={item.slug}
                href={`/use-cases/${item.slug}`}
                className="catalog-card p-5 border border-line bg-white hover:border-orange transition"
              >
                <p className="kicker">{item.industry}</p>
                <p className="mt-2 font-display text-[14.5px] font-bold uppercase tracking-wide text-navy">
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
