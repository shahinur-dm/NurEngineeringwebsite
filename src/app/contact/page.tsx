import type { Metadata } from "next";
import { CatalogShell } from "@/components/CatalogShell";
import { ContactForm } from "@/components/ContactForm";
import { GoogleMap } from "@/components/GoogleMap";
import {
  getCategories,
  getProductBySlug,
  getServiceBySlug,
  getSettings,
} from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  return buildPageMetadata({
    site,
    title: "Contact",
    description: "Request a quote for machine parts or technical service.",
    path: "/contact",
  });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; service?: string; subject?: string }>;
}) {
  const sp = await searchParams;
  const [categories, settings, product, service] = await Promise.all([
    getCategories("product"),
    getSettings(),
    sp.product ? getProductBySlug(sp.product) : Promise.resolve(null),
    sp.service ? getServiceBySlug(sp.service) : Promise.resolve(null),
  ]);

  const subject = product
    ? `Quote: ${product.name}`
    : service
      ? `Service: ${service.title}`
      : sp.subject;

  return (
    <CatalogShell categories={categories} showSearch={false}>
      <div className="section-label">Contact</div>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-line bg-navy p-6 text-white md:p-8">
          <h1 className="font-display text-3xl font-bold uppercase">
            Send a part number or photo
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            We reply with options, stock and pricing. Same desk for products and
            technical service.
          </p>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-orange-bright">
                Phone
              </dt>
              <dd className="mt-1 font-display text-xl">
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-orange-bright">
                Email
              </dt>
              <dd className="mt-1">
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-orange-bright">
                Address
              </dt>
              <dd className="mt-1">{settings.address}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-orange-bright">
                Hours
              </dt>
              <dd className="mt-1">{settings.hours}</dd>
            </div>
          </dl>
        </div>
        <div className="border border-line bg-white p-6 md:p-8">
          {(product || service) && (
            <p className="mb-4 text-sm text-orange">
              Inquiry about: {product?.name || service?.title}
            </p>
          )}
          <ContactForm
            defaultSubject={subject}
            productId={product ? String(product._id) : undefined}
            serviceId={service ? String(service._id) : undefined}
          />
        </div>
      </div>
      <GoogleMap />
    </CatalogShell>
  );
}
