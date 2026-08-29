"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useSite, useUseCases } from "@/components/SiteProvider";
import { Logo } from "@/components/Logo";

export function NavBar() {
  const router = useRouter();
  const site = useSite();
  const useCases = useUseCases();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const rawNav = site.nav?.length ? site.nav : [];
  const hasBlog = rawNav.some((item) => item.href === "/blog");
  const fullNav = hasBlog
    ? rawNav
    : [...rawNav, { href: "/blog", label: "Blog", order: 7 }];
  const nav = [...fullNav].sort((a, b) => a.order - b.order);

  function isActive(href: string) {
    const url = new URL(href, "http://local.nav");
    const path = url.pathname;
    const wantedCat = url.searchParams.get("category");
    const currentCat = searchParams.get("category");

    if (path === "/") return pathname === "/";

    if (wantedCat) {
      return pathname === path && currentCat === wantedCat;
    }

    const siblingOwnsCategory = nav.some((item) => {
      if (item.href === href) return false;
      const other = new URL(item.href, "http://local.nav");
      return (
        other.pathname === path &&
        other.searchParams.get("category") === currentCat &&
        Boolean(currentCat) &&
        pathname === path
      );
    });
    if (siblingOwnsCategory) return false;

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const value = q.trim();
    setSearchOpen(false);
    setOpen(false);
    if (!value) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(value)}`);
  }

  return (
    <header className="relative z-40 border-b border-line bg-white shadow-[0_2px_12px_rgba(11,31,51,0.04)]">
      <div className="shell flex items-center justify-between py-2 md:py-2.5">
        {/* Left: Logo & Company Name Branding */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0">
          <div className="shrink-0 scale-90 sm:scale-100 origin-left">
            <Logo size={46} />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="font-display text-[17px] sm:text-[21px] md:text-[23px] font-extrabold uppercase leading-none tracking-[0.03em] sm:tracking-[0.04em] truncate">
              <span className="text-navy">NUR </span>
              <span className="text-orange">ENGINEERING</span>
            </div>
            <span className="mt-0.5 sm:mt-1 text-[9.5px] sm:text-[11px] font-medium leading-none tracking-tight text-steel truncate">
              Machine, Spare Parts &amp; Technical Service
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-5 lg:gap-8 md:flex">
          {nav.map((link) => {
            const active = isActive(link.href);
            const isProducts = link.href === "/products";
            const isUseCases = link.href === "/use-cases";

            if (isUseCases) {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setCasesOpen(true)}
                  onMouseLeave={() => setCasesOpen(false)}
                >
                  <Link
                    href="/use-cases"
                    className={`relative flex items-center gap-1 py-4 font-display text-[13px] font-bold uppercase tracking-[0.08em] transition ${
                      active
                        ? "text-orange"
                        : "text-navy hover:text-orange"
                    }`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={casesOpen}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-1.5 left-0 h-[2px] w-full bg-orange" />
                    )}
                  </Link>

                  {/* Mega Menu for Use Cases on Desktop */}
                  {casesOpen && (
                    <div
                      className="absolute top-full left-1/2 z-50 -translate-x-1/2 border-t-2 border-orange bg-white p-6 shadow-[0_28px_60px_rgba(11,31,51,0.16)] min-w-[540px] max-w-2xl"
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                        <p className="kicker">Company use cases</p>
                        <Link
                          href="/use-cases"
                          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange hover:text-navy"
                        >
                          View all notes →
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {useCases.slice(0, 4).map((item) => (
                          <Link
                            key={item.slug}
                            href={`/use-cases/${item.slug}`}
                            className="block rounded border border-line p-3 transition hover:border-orange/60 hover:bg-paper"
                          >
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-orange">
                              {item.industry}
                            </p>
                            <h4 className="mt-1 font-display text-sm font-bold uppercase leading-snug text-navy">
                              {item.title}
                            </h4>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-steel">
                              {item.summary}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1 py-4 font-display text-[13px] font-bold uppercase tracking-[0.08em] transition ${
                  active
                    ? "text-orange"
                    : "text-navy hover:text-orange"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span>{link.label}</span>
                {isProducts && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3 fill-none stroke-current opacity-70"
                    strokeWidth="2.5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
                {active && (
                  <span className="absolute bottom-1.5 left-0 h-[2px] w-full bg-orange" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search Button & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Circular Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-navy text-white shadow-sm transition hover:bg-orange hover:shadow-md"
            aria-label="Search products"
            title="Search products"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-none stroke-current"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-line text-navy hover:bg-paper md:hidden shrink-0"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current"
              strokeWidth="2"
            >
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Search Input Bar (Dropdown Overlay) */}
      {searchOpen && (
        <div className="border-t border-orange/40 bg-navy shadow-xl">
          <div className="shell py-2.5 sm:py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full items-center overflow-hidden rounded border border-line bg-white shadow-sm"
            >
              <span className="grid w-9 sm:w-11 place-items-center text-mist shrink-0" aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
              </span>
              <input
                type="search"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search PLC, motor, VFD, sensor, SKU..."
                className="min-h-10 sm:min-h-11 w-full bg-transparent pr-2 sm:pr-3 text-xs sm:text-sm text-navy outline-none placeholder:text-mist min-w-0"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="btn-orange min-h-10 sm:min-h-11 shrink-0 rounded-none px-4 sm:px-6 text-xs sm:text-sm"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-2.5 sm:px-3 text-steel transition hover:text-navy text-xs sm:text-sm"
                aria-label="Close search"
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {open && (
        <div className="border-t border-line bg-white py-3 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="shell flex flex-col divide-y divide-line/60">
            {nav.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between py-3 font-display text-[13px] font-bold uppercase tracking-wider transition ${
                    active ? "text-orange" : "text-navy hover:text-orange"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
