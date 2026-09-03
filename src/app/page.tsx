import { CatalogShell } from "@/components/CatalogShell";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { SpecialFeaturesSection } from "@/components/SpecialFeaturesSection";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import {
  getBanners,
  getCategories,
  getProducts,
  getProductsTotalCount,
  getServices,
  getFeatures,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const pageSize = 20;

  const [categories, banners, services, features, products, totalProducts] = await Promise.all([
    getCategories("product"),
    getBanners(),
    getServices(),
    getFeatures(),
    getProducts({ page: currentPage, limit: pageSize }),
    getProductsTotalCount(),
  ]);

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <CatalogShell categories={categories}>
      <HeroSlider banners={banners} />

      {/* 1. COMPANY SERVICES — Compact 6 Boxes */}
      <section>
        <div className="mb-1 sm:mb-1.5 flex items-center justify-between gap-4">
          <div className="section-label !mb-0">Company services</div>
          <Link
            href="/services"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange transition hover:text-navy shrink-0"
          >
            All services →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {services.slice(0, 6).map((service, i) => (
            <Link
              key={service.slug || String(service._id)}
              href={`/services/${service.slug}`}
              className="group bg-white border border-line p-2 sm:p-2.5 text-center rounded-[2px] shadow-xs hover:border-orange hover:shadow-sm transition flex flex-col items-center justify-center min-h-[54px] sm:min-h-[56px]"
            >
              <span className="font-display text-[12px] sm:text-[13px] font-bold text-navy/70 group-hover:text-orange transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-0.5 text-[11px] sm:text-[11.5px] font-bold text-navy leading-tight line-clamp-2">
                {service.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. SPECIAL FEATURES — Compact 3 Columns with See More Toggle */}
      <SpecialFeaturesSection features={features} />

      {/* 3. OUR PRODUCT — 20 Products, 5 per Row */}
      <section>
        <div className="section-label">Our product</div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={String(product._id)} product={product} size="sm" />
          ))}
        </div>

        {/* View More Product Link */}
        <div className="pt-3.5 text-center">
          <Link
            href="/products"
            className="inline-block font-display text-[12px] font-bold uppercase tracking-[0.16em] text-orange hover:text-navy transition"
          >
            View More Product →
          </Link>
        </div>

        {/* Dynamic Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/"
        />
      </section>
    </CatalogShell>
  );
}
