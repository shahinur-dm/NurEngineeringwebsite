"use client";

import Link from "next/link";
import { useSite, useUseCases } from "@/components/SiteProvider";
import { Logo } from "@/components/Logo";

export function Footer() {
  const site = useSite();
  const useCases = useUseCases();
  const nav = [...(site.nav || [])].sort((a, b) => a.order - b.order);
  const noticeText =
    site.notice || "Out of stock products will be delivered within 3-5 days.";

  return (
    <footer className="mt-8 sm:mt-10 bg-navy text-white">
      <div className="h-[3px] bg-orange" />

      {/* Footer Notice Ticker — Seamless Continuous Marquee */}
      <div className="border-b border-white/10 py-2 overflow-hidden bg-navy">
        <div
          className="notice-ticker-container shell overflow-hidden flex items-center cursor-default select-none relative"
          title="Notice (Hover to pause)"
        >
          <div className="notice-ticker-track">
            {/* Primary Content Group */}
            <div className="notice-ticker-group">
              {[0, 1, 2, 3].map((i) => (
                <span key={`fg1-${i}`} className="notice-ticker-item">
                  <span className="notice-label">NOTICE:</span>
                  <span className="notice-text">{noticeText}</span>
                </span>
              ))}
            </div>
            {/* Exact Duplicated Group for Infinite Seamless Loop */}
            <div className="notice-ticker-group" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={`fg2-${i}`} className="notice-ticker-item">
                  <span className="notice-label">NOTICE:</span>
                  <span className="notice-text">{noticeText}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-8 sm:gap-10 md:gap-12 py-10 sm:py-14 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.35fr_.7fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3.5">
            <Logo size={54} src={site.logoUrl || (site as unknown as { logo?: string }).logo} />
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-[0.08em]">
                {site.brandName}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-white/55">{site.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            {site.description}
          </p>
        </div>
        <div>
          <p className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-orange-bright">
            Menu
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 transition hover:text-orange-bright">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-orange-bright">
            Use cases
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {useCases.slice(0, 6).map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/use-cases/${item.slug}`}
                  className="text-white/70 transition hover:text-orange-bright"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-orange-bright">
            Contact
          </p>
          <ul className="mt-5 space-y-2.5 text-sm leading-6 text-white/70">
            <li>
              <a href={`tel:${site.phone}`} className="transition hover:text-orange-bright">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="transition hover:text-orange-bright">
                {site.email}
              </a>
            </li>
            <li>{site.address}</li>
            <li>{site.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-1 py-4 text-[11px] uppercase tracking-[0.14em] text-white/40 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {site.brandName}
          </span>
          <span>EEE machine parts · Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
