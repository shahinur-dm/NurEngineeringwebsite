"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSite, useUseCases } from "@/components/SiteProvider";
import { Logo } from "@/components/Logo";
import type { PopulatedProduct } from "@/lib/data";

export function NavBar() {
  const router = useRouter();
  const site = useSite();
  const useCases = useUseCases();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);

  // Live search state
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PopulatedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const rawNav = site.nav?.length ? site.nav : [];
  const hasBlog = rawNav.some((item) => item.href === "/blog");
  const fullNav = (hasBlog
    ? rawNav
    : [...rawNav, { href: "/blog", label: "Blog", order: 7 }]
  ).map((item) => (item.href === "/use-cases" ? { ...item, label: "Our Services" } : item));
  const nav = [...fullNav].sort((a, b) => a.order - b.order);

  // Debounced live search fetch
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=6`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResults(json.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Live search fetch error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [q]);

  // Click outside to close live search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setShowResults(false);
      } else if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        !mobileSearchRef.current
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setShowResults(false);
    setMobileSearchOpen(false);
    setOpen(false);
    if (!value) {
      router.push("/products");
      return;
    }
    router.push(`/products?q=${encodeURIComponent(value)}`);
  }

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="md:sticky md:top-0 md:z-40 border-b border-line bg-white shadow-[0_2px_12px_rgba(11,31,51,0.04)]">
      <div className="shell flex items-center justify-between py-2 md:py-2.5 gap-2 sm:gap-3">
        {/* Left: Logo & Company Name Branding (Slightly Larger) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 md:shrink-0 group min-w-0 mr-2 md:mr-4 lg:mr-8">
          <div className="shrink-0">
            <Logo size={52} src={site.logoUrl || (site as unknown as { logo?: string }).logo} />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="font-display text-[18px] sm:text-[22px] md:text-[24px] font-extrabold uppercase leading-none tracking-[0.03em] sm:tracking-[0.04em] truncate">
              <span className="text-navy">{(site.brandName || "NUR ENGINEERING").split(" ")[0]} </span>
              <span className="text-orange">{(site.brandName || "NUR ENGINEERING").split(" ").slice(1).join(" ")}</span>
            </div>
            <span className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11.5px] font-medium leading-none tracking-tight text-steel truncate">
              {site.tagline || "Machine, Spare Parts & Technical Service"}
            </span>
          </div>
        </Link>

        {/* Center-Left: Desktop Navigation Links (Slightly Larger Font & Shifted Left) */}
        <nav className="hidden items-center gap-3.5 md:gap-4 lg:gap-5.5 xl:gap-7 md:flex mr-auto shrink-0">
          {nav.map((link) => {
            const active = isActive(link.href);
            const isProducts = link.href === "/products";
            const isUseCases = link.href === "/use-cases";

            if (isUseCases) {
              return (
                <div
                  key={link.href}
                  className="relative shrink-0"
                  onMouseEnter={() => setCasesOpen(true)}
                  onMouseLeave={() => setCasesOpen(false)}
                >
                  <Link
                    href="/use-cases"
                    className={`relative flex items-center gap-1 py-3.5 font-display text-[14px] lg:text-[14.5px] xl:text-[15px] font-bold uppercase tracking-[0.05em] whitespace-nowrap shrink-0 transition ${
                      active
                        ? "text-orange"
                        : "text-navy hover:text-orange"
                    }`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={casesOpen}
                  >
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute bottom-1 left-0 h-[2.5px] w-full bg-orange" />
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
                className={`relative flex items-center gap-1 py-3.5 font-display text-[14px] lg:text-[14.5px] xl:text-[15px] font-bold uppercase tracking-[0.05em] whitespace-nowrap shrink-0 transition ${
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
                    width="12"
                    height="12"
                    className="h-3 w-3 fill-none stroke-current opacity-70 shrink-0"
                    strokeWidth="2.5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
                {active && (
                  <span className="absolute bottom-1 left-0 h-[2.5px] w-full bg-orange" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Compact Header Live Search & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop / Laptop Live Search Input & Dropdown */}
          <div className="relative hidden md:block shrink-0" ref={searchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center rounded-[2px] border-2 border-navy bg-white overflow-hidden h-[34px] md:h-[36px] w-[180px] md:w-[195px] lg:w-[240px] xl:w-[270px] shadow-[0_1px_2px_rgba(11,31,51,0.06)] transition focus-within:border-orange shrink-0"
            >
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search PLC, servo drives, heaters, sensors, part numbers..."
                className="w-full bg-transparent px-2.5 text-[11.5px] md:text-xs text-navy placeholder:text-steel/70 placeholder:font-normal outline-none min-w-0"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setResults([]);
                    setShowResults(false);
                  }}
                  className="text-mist hover:text-navy text-xs font-bold shrink-0 px-1"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="bg-navy text-white hover:bg-orange transition flex items-center gap-1 px-2.5 md:px-3 h-full shrink-0 font-display text-xs font-bold uppercase tracking-wider select-none cursor-pointer"
                title="Search products"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  className="h-3.5 w-3.5 fill-none stroke-current shrink-0"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <span className="hidden sm:inline">SEARCH</span>
              </button>
            </form>

            {/* Live Search Vertical Dropdown (Desktop) */}
            {showResults && q.trim().length > 0 && (
              <div className="absolute right-0 top-full mt-1 z-50 w-[300px] sm:w-[340px] max-w-[90vw] rounded-lg border border-line bg-white shadow-2xl overflow-hidden divide-y divide-line/60 animate-in fade-in slide-in-from-top-1 duration-150">
                {loading ? (
                  <div className="p-4 text-center text-xs text-mist font-medium flex items-center justify-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-orange border-t-transparent animate-spin" />
                    <span>Searching products...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div>
                    <div className="bg-paper/90 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-mist flex justify-between items-center border-b border-line">
                      <span>Matching Products ({results.length})</span>
                      <span className="text-[9.5px] font-bold text-orange">Live Result</span>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto divide-y divide-line/40">
                      {results.map((product) => (
                        <Link
                          key={String(product._id || product.slug)}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            setShowResults(false);
                            setQ("");
                          }}
                          className="flex items-center gap-3 p-2.5 transition hover:bg-paper group"
                        >
                          <div className="h-10 w-10 shrink-0 rounded border border-line/80 bg-paper/50 overflow-hidden flex items-center justify-center p-0.5">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="font-display text-[10px] font-bold text-mist uppercase">
                                NES
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display text-xs sm:text-[13px] font-bold uppercase text-navy group-hover:text-orange leading-snug line-clamp-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-steel">
                              {product.category?.name && (
                                <span className="truncate text-orange font-semibold">
                                  {product.category.name}
                                </span>
                              )}
                              {product.sku && (
                                <span className="truncate font-mono text-mist">
                                  SKU: {product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/products?q=${encodeURIComponent(q.trim())}`}
                      onClick={() => setShowResults(false)}
                      className="block bg-paper/80 p-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-orange hover:bg-orange hover:text-white transition"
                    >
                      View all products for &ldquo;{q.trim()}&rdquo; →
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-mist font-medium">
                    No products found for &ldquo;{q.trim()}&rdquo;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 md:hidden shrink-0 cursor-pointer items-center justify-center rounded-full bg-navy text-white shadow-xs transition hover:bg-orange"
            aria-label="Search products"
            title="Search products"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
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
              width="20"
              height="20"
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

      {/* Mobile Live Search Dropdown Drawer */}
      {mobileSearchOpen && (
        <div className="border-t border-line bg-white p-3 md:hidden shadow-lg animate-in fade-in slide-in-from-top-1 duration-150" ref={mobileSearchRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center rounded-[2px] border-2 border-navy bg-white overflow-hidden h-9"
          >
            <input
              type="text"
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowResults(true);
              }}
              placeholder="Search PLC, servo drives, heaters, sensors, part numbers..."
              className="w-full bg-transparent px-2.5 text-xs text-navy placeholder:text-steel/70 outline-none min-w-0"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setResults([]);
                }}
                className="text-mist hover:text-navy text-xs font-bold shrink-0 px-1.5"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="bg-navy text-white hover:bg-orange transition flex items-center gap-1.5 px-3 h-full shrink-0 font-display text-xs font-bold uppercase tracking-wider"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2.5">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span>SEARCH</span>
            </button>
          </form>

          {/* Mobile Live Results */}
          {q.trim().length > 0 && (
            <div className="mt-2 rounded border border-line bg-white overflow-hidden divide-y divide-line/60">
              {loading ? (
                <div className="p-3 text-center text-xs text-mist font-medium">
                  Searching products...
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div className="max-h-[260px] overflow-y-auto divide-y divide-line/40">
                    {results.map((product) => (
                      <Link
                        key={String(product._id || product.slug)}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setMobileSearchOpen(false);
                          setShowResults(false);
                          setQ("");
                        }}
                        className="flex items-center gap-2.5 p-2 transition hover:bg-paper"
                      >
                        <div className="h-8 w-8 shrink-0 rounded border border-line/80 bg-paper/50 overflow-hidden flex items-center justify-center p-0.5">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="font-display text-[9px] font-bold text-mist uppercase">
                              NES
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-xs font-bold uppercase text-navy leading-snug line-clamp-1">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-orange font-semibold">
                            {product.category?.name || "Product"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/products?q=${encodeURIComponent(q.trim())}`}
                    onClick={() => {
                      setMobileSearchOpen(false);
                      setShowResults(false);
                    }}
                    className="block bg-paper/80 p-2 text-center text-[10.5px] font-bold uppercase tracking-wider text-orange hover:bg-orange hover:text-white transition"
                  >
                    View all results →
                  </Link>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-mist font-medium">
                  No products found for &ldquo;{q.trim()}&rdquo;.
                </div>
              )}
            </div>
          )}
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
                  className={`flex items-center justify-between py-3 font-display text-[14px] font-bold uppercase tracking-wider transition ${
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

