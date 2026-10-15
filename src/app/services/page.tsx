import type { Metadata } from "next";
import Link from "next/link";
import { CatalogShell } from "@/components/CatalogShell";
import { RelatedSearch } from "@/components/RelatedSearch";
import { ServiceCard } from "@/components/ServiceCard";
import { getCategories, getServices, getSettings } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return buildPageMetadata({
    site,
    title: "Industrial Automation & Technical Services",
    description:
      "Expert engineering and automation services by Nur Engineering Solution: PLC automation, servo system retrofitting, PLC conversion, robotics, injection molding machine service, and plant maintenance in Bangladesh.",
    path: "/services",
    keywords: [
      "PLC Automation Bangladesh",
      "PLC Conversion Service",
      "Industrial Automation Solutions",
      "Servo System Retrofit",
      "Injection Molding Machine Automation",
      "Industrial Robotics and Automation",
      "Technical Engineering Services",
    ],
  });
}

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([
    getCategories("product"),
    getServices(),
  ]);

  return (
    <CatalogShell categories={categories}>
      <h1 className="section-label">Industrial Automation &amp; Technical Services</h1>
      <p className="-mt-2 mb-4 max-w-2xl text-sm leading-6 text-steel">
        Complete engineering solutions: PLC automation, servo system retrofit, PLC conversion, machine repair, and technical service for industrial plants across Bangladesh.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {services.map((service) => (
          <ServiceCard key={String(service._id)} service={service} />
        ))}
      </div>
      <div className="border border-line bg-white p-6">
        <p className="font-display text-xl font-bold uppercase text-navy">
          Need a part matched today?
        </p>
        <p className="mt-2 text-sm text-steel">
          Send a photo, nameplate or part number.
        </p>
        <Link href="/contact" className="btn-orange mt-4 inline-flex">
          Contact
        </Link>
      </div>
      <RelatedSearch currentHref="/services" />
    </CatalogShell>
  );
}
