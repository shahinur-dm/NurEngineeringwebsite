"use client";

import { useSite } from "@/components/SiteProvider";

export function GoogleMap() {
  const site = useSite();
  let src = site.mapEmbedUrl?.trim();
  if (!src) {
    const q = encodeURIComponent(site.address || "Dhaka, Bangladesh");
    src = `https://maps.google.com/maps?q=${q}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }

  return (
    <div className="relative w-full overflow-hidden border border-line bg-paper">
      <iframe
        title={`${site.brandName} location`}
        src={src}
        className="h-72 w-full border-0 md:h-[380px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
