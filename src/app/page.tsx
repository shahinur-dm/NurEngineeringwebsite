import { CatalogShell } from "@/components/CatalogShell";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";
import { ServiceCard } from "@/components/ServiceCard";
import Link from "next/link";
import {
  getBanners,
  getCategories,
  getProducts,
  getServices,
  getUseCases,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, banners, featured, latest, services, useCases] = await Promise.all([
    getCategories("product"),
    getBanners(),
    getProducts({ featured: true, limit: 4 }),
    getProducts({ limit: 24 }),
    getServices({ featured: true }),
    getUseCases(),
  ]);

  const smallParts = latest.filter((p) => !p.featured).slice(0, 5);

  return (
    <CatalogShell categories={categories}>
      <HeroSlider banners={banners} />

      <section>
        <div className="flex items-end justify-between gap-4">
          <div className="section-label">Company use cases</div>
          <Link
            href="/use-cases"
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange transition hover:text-navy"
          >
            All notes →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {useCases.slice(0, 6).map((item, i) => (
            <Link
              key={item.slug}
              href={`/use-cases/${item.slug}`}
              className="catalog-card relative p-5"
            >
              <span className="absolute right-4 top-4 font-display text-2xl font-bold text-navy/8">
                0{i + 1}
              </span>
              <p className="kicker">{item.industry}</p>
              <h3 className="mt-2 pr-8 font-display text-[15px] font-bold uppercase leading-snug tracking-wide text-navy">
                {item.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-steel">
                {item.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">Featured machine parts</div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={String(product._id)} product={product} size="lg" />
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">Technical service provider</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {services.slice(0, 5).map((service) => (
            <ServiceCard key={String(service._id)} service={service} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-label">More spare parts</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {smallParts.map((product) => (
            <ProductCard key={String(product._id)} product={product} size="sm" />
          ))}
        </div>
      </section>
    </CatalogShell>
  );
}
