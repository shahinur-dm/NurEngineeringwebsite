"use client";

import { useSite } from "@/components/SiteProvider";

export function GoogleMap() {
  const site = useSite();
  const src =
    site.mapEmbedUrl ||
    "https://maps.google.com/maps?q=Dhaka%2C%20Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed";

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
