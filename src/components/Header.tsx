"use client";

import { Logo } from "@/components/Logo";
import { useSite } from "@/components/SiteProvider";

export function Header() {
  const site = useSite();

  return (
    <header className="border-b border-line bg-white">
      <div className="h-[3px] bg-orange" />
      <div className="shell grid items-center gap-5 py-5 md:grid-cols-[auto_1fr_auto] md:py-6">
        <Logo size={76} />

        <div className="min-w-0 text-center md:px-4">
          <p className="font-display text-[clamp(1.7rem,3.6vw,2.65rem)] font-bold uppercase leading-[0.95] tracking-[0.06em] text-navy">
            {site.brandName}
          </p>
          <p className="mx-auto mt-2.5 max-w-xl text-[12px] leading-5 tracking-[0.04em] text-steel md:text-[13px]">
            {site.tagline}
          </p>
        </div>

        <div className="hidden min-w-[13.5rem] border-l border-line pl-6 text-right md:block">
          <p className="kicker">Call / WhatsApp</p>
          <a
            href={`tel:${site.phone}`}
            className="mt-1.5 block font-display text-[1.35rem] font-bold leading-none tracking-wide text-navy"
          >
            {site.phone}
          </a>
          <p className="mt-2 text-[12px] leading-5 text-mist">
            {site.address}
            <br />
            {site.hours}
          </p>
        </div>
      </div>
    </header>
  );
}
