import { CatalogShell } from "@/components/CatalogShell";
import { HeroSlider } from "@/components/HeroSlider";
import { SpecialFeaturesSection } from "@/components/SpecialFeaturesSection";
import { OurProductSection } from "@/components/OurProductSection";
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
  const homeServices = services.slice(0, 6);

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
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 ${homeServices.length >= 6 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
          {homeServices.map((service) => (
            <Link
              key={service.slug || String(service._id)}
              href={`/services/${service.slug}`}
              className="group bg-white border border-line px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-[2px] shadow-xs hover:border-orange hover:shadow-sm transition flex items-center justify-start gap-1.5 min-h-[54px] sm:min-h-[56px] min-w-0"
            >
              <ServiceItemIcon label={`${service.title} ${service.slug}`} />
              <span className="min-w-0 text-[12px] sm:text-[12.5px] font-bold text-navy leading-none max-sm:line-clamp-2 sm:whitespace-nowrap">
                {service.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. SPECIAL FEATURES — Compact 3 Columns with See More Toggle */}
      <SpecialFeaturesSection features={features} categories={categories} />

      {/* 3. OUR PRODUCT — 20 Products with Client-Side Load More & Dynamic Pagination */}
      <OurProductSection
        initialProducts={products}
        totalProducts={totalProducts}
        pageSize={pageSize}
        initialPage={currentPage}
      />
    </CatalogShell>
  );
}

function ServiceItemIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  const kind = key.includes("plc") || key.includes("program")
    ? "plc"
    : key.includes("motor") || key.includes("drive")
      ? "motor"
      : key.includes("panel") || key.includes("control")
        ? "panel"
        : key.includes("sensor") || key.includes("automation")
          ? "sensor"
          : key.includes("spare") || key.includes("sourc") || key.includes("parts")
            ? "parts"
            : key.includes("robot")
              ? "robot"
              : key.includes("install") || key.includes("factory")
                ? "factory"
                : key.includes("technical") || key.includes("service")
                  ? "tool"
                  : key.includes("machin")
                    ? "machine"
                    : "gear";

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 fill-none stroke-current text-orange"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === "plc" && (
        <>
          <rect x="6" y="3" width="12" height="6" rx="1" />
          <rect x="5" y="11" width="14" height="10" rx="1.5" />
          <path d="M9 15h6M9 18h4" />
        </>
      )}
      {kind === "motor" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" />
        </>
      )}
      {kind === "panel" && (
        <>
          <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
          <path d="M8 9h2.5M8 13h2.5M14 9h3.5M14 13h3.5M8 17h8" />
        </>
      )}
      {kind === "sensor" && (
        <>
          <circle cx="12" cy="14" r="4" />
          <path d="M12 4v3M6.2 7.2l2 2M17.8 7.2l-2 2" />
        </>
      )}
      {kind === "parts" && (
        <>
          <path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5z" />
          <path d="M3.5 12.2 12 16.7l8.5-4.5M3.5 15.8 12 20.3l8.5-4.5" />
        </>
      )}
      {kind === "robot" && (
        <>
          <rect x="7" y="8" width="10" height="9" rx="1.5" />
          <path d="M12 8V5M9 21v-2.5M15 21v-2.5M5 12.5h2M17 12.5h2" />
          <circle cx="10" cy="12.5" r="0.8" fill="currentColor" />
          <circle cx="14" cy="12.5" r="0.8" fill="currentColor" />
        </>
      )}
      {kind === "factory" && <path d="M3 21V10l5 3.5V10l5 3.5V6l6 4v11H3z" />}
      {kind === "tool" && (
        <path d="M14.7 6.3a3.8 3.8 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a3.8 3.8 0 0 0 5.4-5.4l-2.1 2.1-3-3 2.1-2.1z" />
      )}
      {kind === "machine" && (
        <>
          <rect x="3.5" y="9" width="17" height="10" rx="1.2" />
          <path d="M8 9V6h8v3M8.5 14h7" />
        </>
      )}
      {kind === "gear" && (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2.4M12 18.1v2.4M4.4 7.1l1.8 1.8M17.8 15.1l1.8 1.8M3.5 12h2.4M18.1 12h2.4M4.4 16.9l1.8-1.8M17.8 8.9l1.8-1.8" />
        </>
      )}
    </svg>
  );
}

