import { getSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/seo";

export async function JsonLd() {
  const site = await getSettings();
  const url = getSiteUrl();

  const logoUrl =
    site.logoUrl?.trim() ||
    site.footerLogoUrl?.trim() ||
    "https://res.cloudinary.com/dqkaseoio/image/upload/f_auto,q_auto/v1791644083/nur-engineering/migrated/b43abf0fa8a5232756eead2159ec655c0effa8c2a552aac4b4c3ffeb8ddafa8b.jpg";

  const sameAs: string[] = [];
  if (site.social?.facebook) sameAs.push(site.social.facebook);
  if (site.social?.linkedin) sameAs.push(site.social.linkedin);
  if (site.social?.youtube) sameAs.push(site.social.youtube);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brandName,
    url,
    logo: logoUrl,
    email: site.email,
    telephone: site.phone,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "customer service",
        email: site.email,
        availableLanguage: ["English", "Bengali"],
      },
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.brandName,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
