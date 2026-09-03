import { CatalogShell } from "@/components/CatalogShell";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { ServiceCard } from "@/components/ServiceCard";
import { SpecialFeaturesSection } from "@/components/SpecialFeaturesSection";
import Link from "next/link";
import {
  getBanners,
  getCategories,
  getProducts,
  getServices,
  getFeatures,
} from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [categories, banners, featured, latest, services, features] = await Promise.all([
    getCategories("product"),
    getBanners(),
    getProducts({ featured: true, limit: 4 }),
    getProducts({ limit: 24 }),
    getServices(),
    getFeatures(),
  ]);

  const smallParts = latest.filter((p) => !p.featured).slice(0, 5);

  return (
    <CatalogShell categories={categories}>
      <HeroSlider banners={banners} />

      {/* 1. COMPANY SERVICES — Compact 6 Boxes */}
      <section>
        <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-4">
          <div className="section-label mb-0">Company services</div>
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

      <section>
        <div className="section-label">Featured machine parts</div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={String(product._id)} product={product} size="lg" />
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">Technical service provider</div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {services.slice(0, 5).map((service) => (
            <ServiceCard key={String(service._id)} service={service} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">More spare parts</div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {smallParts.map((product) => (
            <ProductCard key={String(product._id)} product={product} size="sm" />
          ))}
        </div>
      </section>
    </CatalogShell>
  );
}
