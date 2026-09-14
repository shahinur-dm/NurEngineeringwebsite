"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSite, useUseCases } from "@/components/SiteProvider";
import { Logo } from "@/components/Logo";
import { NoticeTickerItems } from "@/components/NoticeTickerItems";

export function Footer() {
  const pathname = usePathname();
  const site = useSite();
  const useCases = useUseCases();

  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const rawNav = site.nav?.length ? site.nav : [];
  const nav = [...rawNav]
    .map((item) => (item.href === "/use-cases" ? { ...item, label: "Our Services" } : item))
    .sort((a, b) => a.order - b.order);

  // Safe social links
  const facebookUrl = site.social?.facebook || "https://www.facebook.com/";
  const linkedinUrl = site.social?.linkedin || "https://www.linkedin.com/";
  const youtubeUrl = site.social?.youtube || "https://www.youtube.com/";
  const rawWa = site.social?.whatsapp || site.phone || "+880170000000";
  const whatsappUrl = rawWa.startsWith("http")
    ? rawWa
    : `https://wa.me/${rawWa.replace(/[^\d+]/g, "").replace(/^\+/, "")}`;

  // QR Code settings
  const footerQr = site.footerQr || {};
  const showWechatQr = footerQr.wechatQrEnabled !== false;
  const wechatQrImg = footerQr.wechatQr || "";
  const wechatQrLabel = footerQr.wechatQrLabel || "WECHAT QR SCAN";

  const showWhatsappQr = footerQr.whatsappQrEnabled !== false;
  const whatsappQrImg = footerQr.whatsappQr || "";
  const whatsappQrLabel = footerQr.whatsappQrLabel || "WHATSAPP QR SCAN";

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
              {[0, 1].map((i) => (
                <NoticeTickerItems
                  key={`fg1-${i}`}
                  noticeBn={site.noticeBn}
                  noticeEn={site.notice}
                />
              ))}
            </div>
            {/* Exact Duplicated Group for Infinite Seamless Loop */}
            <div className="notice-ticker-group" aria-hidden="true">
              {[0, 1].map((i) => (
                <NoticeTickerItems
                  key={`fg2-${i}`}
                  noticeBn={site.noticeBn}
                  noticeEn={site.notice}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-8 sm:gap-10 md:gap-10 py-10 sm:py-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.75fr_1fr_1.35fr]">
        {/* Left Column: Brand, Tagline, Description & Social Icons */}
        <div>
          <div className="flex items-center gap-3.5 min-w-0">
            <Logo size={68} src={site.logoUrl || (site as unknown as { logo?: string }).logo} />
            <div className="min-w-0 sm:min-w-max">
              <p className="font-display text-[18px] sm:text-[20px] lg:text-[22px] font-extrabold uppercase leading-none tracking-[0.03em] whitespace-normal sm:whitespace-nowrap text-[#00ADEF]">
                {(site.brandName || "NUR ENGINEERING SOLUTION")}
              </p>
              <p className="mt-1 text-[11.5px] sm:text-[12px] font-medium leading-none tracking-tight text-white/55 whitespace-normal sm:whitespace-nowrap">
                {site.tagline || "Machine, spare parts and Technical service provider"}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
            {site.description ||
              "EEE-led supplier of PLC, motors, drives, sensors, and industrial spare parts with technical service across Bangladesh."}
          </p>

          {/* Social Media Icons */}
          <div className="mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 mb-2.5">
              Follow Us
            </p>
            <div className="flex items-center gap-2.5">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-white/5 border border-white/10 text-white/80 transition hover:bg-orange hover:border-orange hover:text-white hover:scale-105"
                >
                  <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-white/5 border border-white/10 text-white/80 transition hover:bg-orange hover:border-orange hover:text-white hover:scale-105"
                >
                  <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}

              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="YouTube"
                  className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-white/5 border border-white/10 text-white/80 transition hover:bg-orange hover:border-orange hover:text-white hover:scale-105"
                >
                  <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-white/5 border border-white/10 text-white/80 transition hover:bg-[#25D366] hover:border-[#25D366] hover:text-white hover:scale-105"
                >
                  <svg width="16" height="16" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Quick Link */}
        <div>
          <p className="font-display text-[14px] sm:text-[15px] font-bold uppercase tracking-[0.14em] text-[#00ADEF]">
            Quick Link
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 transition hover:text-orange">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Our Services */}
        <div>
          <p className="font-display text-[14px] sm:text-[15px] font-bold uppercase tracking-[0.14em] text-[#00ADEF]">
            Our Services
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {useCases.slice(0, 6).map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/use-cases/${item.slug}`}
                  className="text-white/70 transition hover:text-orange"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Contact Us & QR Codes */}
        <div>
          <p className="font-display text-[14px] sm:text-[15px] font-bold uppercase tracking-[0.14em] text-[#00ADEF]">
            Contact Us
          </p>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-[13px] leading-relaxed text-white/80">
            {site.address && (
              <li className="flex items-start gap-2.5">
                <svg width="16" height="16" className="h-4 w-4 shrink-0 stroke-[#00ADEF] fill-none mt-0.5" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  {site.brandName ? <span className="block">{site.brandName}</span> : null}
                  {site.address}
                </span>
              </li>
            )}

            {site.email && (
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-2.5 transition hover:text-orange group"
                >
                  <svg width="16" height="16" className="h-4 w-4 shrink-0 stroke-[#00ADEF] fill-none group-hover:scale-110 transition-transform" strokeWidth="2" viewBox="0 0 24 24">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="truncate">{site.email}</span>
                </a>
              </li>
            )}

            {[site.phone, site.phone2, site.phone3].filter(Boolean).map((num) => (
              <li key={num}>
                <a
                  href={`tel:${String(num).replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-2.5 transition hover:text-orange group"
                >
                  <svg width="16" height="16" className="h-4 w-4 shrink-0 stroke-[#00ADEF] fill-none group-hover:scale-110 transition-transform" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{num}</span>
                </a>
              </li>
            ))}

            {site.social?.whatsapp && (
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-orange group"
                >
                  <svg width="16" height="16" className="h-4 w-4 shrink-0 fill-[#00ADEF] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>{site.social.whatsapp}</span>
                </a>
              </li>
            )}

            {site.wechatId && (
              <li className="flex items-center gap-2.5">
                <svg width="16" height="16" className="h-4 w-4 shrink-0 fill-[#00ADEF]" viewBox="0 0 24 24">
                  <path d="M8.7 3.6c-3.9 0-7 2.8-7 6.3 0 2 1.1 3.8 2.8 5l-.7 2.5 2.6-1.4c.7.2 1.5.3 2.3.3.3 0 .6 0 .9-.1-.2-.6-.3-1.2-.3-1.8 0-3.6 3.4-6.5 7.6-6.5.2 0 .5 0 .7 0C16.4 5.5 12.9 3.6 8.7 3.6zm-1.9 3.3c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zm4.1 0c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zM16.4 9.9c-3.5 0-6.3 2.4-6.3 5.4s2.8 5.4 6.3 5.4c.6 0 1.2-.1 1.8-.2l2.1 1.1-.5-2c1.3-1 2.2-2.5 2.2-4.3 0-3-2.8-5.4-6.3-5.4zm-2.1 3.2c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zm4.2 0c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z" />
                </svg>
                <span>{site.wechatId}</span>
              </li>
            )}

            {site.hours && (
              <li className="flex items-center gap-2.5">
                <svg width="16" height="16" className="h-4 w-4 shrink-0 stroke-[#00ADEF] fill-none" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{site.hours}</span>
              </li>
            )}
          </ul>

          {/* QR Codes Section */}
          {(showWechatQr || showWhatsappQr) && (
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-start gap-4 sm:gap-5">
              {/* WeChat QR Box */}
              {showWechatQr && (
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-[2px] bg-white p-1 shadow-sm border border-white/20 flex items-center justify-center overflow-hidden">
                    {wechatQrImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={wechatQrImg}
                        alt={wechatQrLabel}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      /* Clean Vector WeChat QR */
                      <svg viewBox="0 0 100 100" className="h-full w-full">
                        {/* QR Matrix Pattern */}
                        <rect width="100" height="100" fill="#ffffff" />
                        {/* Top-Left Finder */}
                        <rect x="6" y="6" width="28" height="28" fill="#070b19" />
                        <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                        <rect x="14" y="14" width="12" height="12" fill="#070b19" />
                        {/* Top-Right Finder */}
                        <rect x="66" y="6" width="28" height="28" fill="#070b19" />
                        <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                        <rect x="74" y="14" width="12" height="12" fill="#070b19" />
                        {/* Bottom-Left Finder */}
                        <rect x="6" y="66" width="28" height="28" fill="#070b19" />
                        <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                        <rect x="14" y="74" width="12" height="12" fill="#070b19" />
                        {/* Data Modules */}
                        <rect x="38" y="10" width="6" height="6" fill="#070b19" />
                        <rect x="48" y="10" width="6" height="6" fill="#070b19" />
                        <rect x="38" y="22" width="6" height="6" fill="#070b19" />
                        <rect x="54" y="22" width="6" height="6" fill="#070b19" />
                        <rect x="10" y="38" width="6" height="6" fill="#070b19" />
                        <rect x="22" y="38" width="6" height="6" fill="#070b19" />
                        <rect x="10" y="52" width="6" height="6" fill="#070b19" />
                        <rect x="70" y="38" width="6" height="6" fill="#070b19" />
                        <rect x="84" y="38" width="6" height="6" fill="#070b19" />
                        <rect x="76" y="50" width="6" height="6" fill="#070b19" />
                        <rect x="38" y="70" width="6" height="6" fill="#070b19" />
                        <rect x="50" y="70" width="6" height="6" fill="#070b19" />
                        <rect x="38" y="84" width="6" height="6" fill="#070b19" />
                        <rect x="54" y="84" width="6" height="6" fill="#070b19" />
                        <rect x="70" y="70" width="6" height="6" fill="#070b19" />
                        <rect x="84" y="76" width="6" height="6" fill="#070b19" />
                        {/* Center WeChat Logo Badge */}
                        <rect x="38" y="38" width="24" height="24" rx="4" fill="#07C160" />
                        <circle cx="46" cy="48" r="3.5" fill="#ffffff" />
                        <circle cx="54" cy="48" r="3.5" fill="#ffffff" />
                        <circle cx="45" cy="48" r="1" fill="#07C160" />
                        <circle cx="55" cy="48" r="1" fill="#07C160" />
                      </svg>
                    )}
                  </div>
                  <span className="mt-1.5 font-display text-[9px] sm:text-[9.5px] font-bold tracking-wider uppercase text-white/80 text-center leading-tight">
                    {wechatQrLabel}
                  </span>
                </div>
              )}

              {/* WhatsApp QR Box */}
              {showWhatsappQr && (
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-[2px] bg-white p-1 shadow-sm border border-white/20 flex items-center justify-center overflow-hidden">
                    {whatsappQrImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={whatsappQrImg}
                        alt={whatsappQrLabel}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      /* Clean Vector WhatsApp QR */
                      <svg viewBox="0 0 100 100" className="h-full w-full">
                        {/* QR Matrix Pattern */}
                        <rect width="100" height="100" fill="#ffffff" />
                        {/* Top-Left Finder */}
                        <rect x="6" y="6" width="28" height="28" fill="#070b19" />
                        <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                        <rect x="14" y="14" width="12" height="12" fill="#070b19" />
                        {/* Top-Right Finder */}
                        <rect x="66" y="6" width="28" height="28" fill="#070b19" />
                        <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                        <rect x="74" y="14" width="12" height="12" fill="#070b19" />
                        {/* Bottom-Left Finder */}
                        <rect x="6" y="66" width="28" height="28" fill="#070b19" />
                        <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                        <rect x="14" y="74" width="12" height="12" fill="#070b19" />
                        {/* Data Modules */}
                        <rect x="40" y="12" width="6" height="6" fill="#070b19" />
                        <rect x="52" y="12" width="6" height="6" fill="#070b19" />
                        <rect x="42" y="24" width="6" height="6" fill="#070b19" />
                        <rect x="50" y="24" width="6" height="6" fill="#070b19" />
                        <rect x="12" y="42" width="6" height="6" fill="#070b19" />
                        <rect x="24" y="42" width="6" height="6" fill="#070b19" />
                        <rect x="12" y="52" width="6" height="6" fill="#070b19" />
                        <rect x="72" y="42" width="6" height="6" fill="#070b19" />
                        <rect x="82" y="42" width="6" height="6" fill="#070b19" />
                        <rect x="74" y="52" width="6" height="6" fill="#070b19" />
                        <rect x="40" y="72" width="6" height="6" fill="#070b19" />
                        <rect x="52" y="72" width="6" height="6" fill="#070b19" />
                        <rect x="42" y="82" width="6" height="6" fill="#070b19" />
                        <rect x="50" y="82" width="6" height="6" fill="#070b19" />
                        <rect x="72" y="72" width="6" height="6" fill="#070b19" />
                        <rect x="82" y="80" width="6" height="6" fill="#070b19" />
                        {/* Center WhatsApp Logo Badge */}
                        <rect x="38" y="38" width="24" height="24" rx="4" fill="#25D366" />
                        <path
                          d="M44 48c0 3.3 2.7 6 6 6 .8 0 1.6-.2 2.3-.5l2.7.7-.7-2.6c.4-.7.7-1.6.7-2.6 0-3.3-2.7-6-6-6s-6 2.7-6 6zm3.3-1.6c.1-.3.3-.3.5-.3h.4c.1 0 .3 0 .4.3.2.4.6 1.4.6 1.5 0 .1 0 .2-.1.3l-.3.4c-.1.1-.2.2-.1.3.2.4.6.9 1.1 1.3.6.5 1.1.7 1.3.8.1 0 .3 0 .4-.1l.5-.6c.1-.1.2-.2.4-.1.1 0 1 .5 1.2.6.2.1.3.2.3.3 0 .2-.1 1.1-.9 1.2-.4.1-.9.1-2.4-.6-1.8-.8-3-2.6-3.1-2.7-.1-.2-.8-1.1-.8-2.1 0-1 .5-1.5.7-1.7z"
                          fill="#ffffff"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="mt-1.5 font-display text-[9px] sm:text-[9.5px] font-bold tracking-wider uppercase text-white/80 text-center leading-tight">
                    {whatsappQrLabel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-1 py-4 text-[11px] uppercase tracking-[0.14em] text-white/40 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {site.brandName || "NUR ENGINEERING SOLUTION"}
          </span>
          <span>EEE machine parts · Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}

