"use client";

import { useSite } from "@/components/SiteProvider";

export function TopBar() {
  const site = useSite();
  const social = [
    { label: "Facebook", href: site.social?.facebook },
    { label: "LinkedIn", href: site.social?.linkedin },
    { label: "YouTube", href: site.social?.youtube },
  ].filter((item) => item.href);

  return (
    <div className="bg-navy-deep text-[11px] text-white/70">
      <div className="shell flex h-8 flex-wrap items-center justify-between gap-x-4">
        <div className="flex flex-wrap items-center gap-x-5">
          <a href={`tel:${site.phone}`} className="transition hover:text-orange-bright">
            {site.phone}
          </a>
          <span className="hidden h-3 w-px bg-white/15 sm:block" />
          <a href={`mailto:${site.email}`} className="transition hover:text-orange-bright">
            {site.email}
          </a>
          <span className="hidden h-3 w-px bg-white/15 md:block" />
          <span className="hidden md:inline">{site.hours}</span>
        </div>
        <div className="flex items-center gap-4">
          {social.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-[0.14em] transition hover:text-orange-bright"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
