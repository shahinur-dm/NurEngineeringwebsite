"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { useSite } from "@/components/SiteProvider";
import { Logo } from "@/components/Logo";
import type { PopulatedProduct } from "@/lib/data";

export function NavBar() {
  const router = useRouter();
  const site = useSite();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [selectedProductCat, setSelectedProductCat] = useState<string | null>(null);
  const [navServices, setNavServices] = useState<Array<{ _id: string; title: string; slug: string }>>([]);
  const [navCatalog, setNavCatalog] = useState<
    Array<{
      name: string;
      slug: string;
      subcategories: Array<{ name: string; slug: string }>;
    }>
  >([]);
  const closeServicesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeProductsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const nav = [...fullNav]
    .filter((item) => item.href !== "/services")
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.services)) setNavServices(data.services);
      })
      .catch(() => {});

    Promise.all([
      fetch("/api/categories?type=product", { cache: "no-store" }).then((res) => res.json()),
      fetch("/api/catalog-tree", { cache: "no-store" }).then((res) => res.json()),
    ])
      .then(([catsJson, treeJson]) => {
        const tree = (treeJson?.tree || {}) as Record<
          string,
          { name: string; slug: string; subcategories?: Array<{ name: string; slug: string }> }
        >;
        const fromTree = Object.values(tree).map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          subcategories: cat.subcategories || [],
        }));
        const fromCats = Array.isArray(catsJson?.categories)
          ? catsJson.categories.map((cat: { name: string; slug: string }) => ({
              name: cat.name,
              slug: cat.slug,
              subcategories: fromTree.find((t) => t.slug === cat.slug)?.subcategories || [],
            }))
          : [];
        const merged = fromCats.length
          ? fromCats.map((cat: { name: string; slug: string; subcategories: Array<{ name: string; slug: string }> }) => {
              const treeMatch = fromTree.find((t) => t.slug === cat.slug);
              return {
                ...cat,
                subcategories: treeMatch?.subcategories?.length ? treeMatch.subcategories : cat.subcategories,
              };
            })
          : fromTree;
        setNavCatalog(merged);
      })
      .catch(() => {});
  }, []);

  function openMenu(kind: "services" | "products") {
    if (kind === "services") {
      if (closeServicesTimer.current) clearTimeout(closeServicesTimer.current);
      setCasesOpen(true);
      setProductsOpen(false);
    } else {
      if (closeProductsTimer.current) clearTimeout(closeProductsTimer.current);
      if (!productsOpen) setSelectedProductCat(null);
      setProductsOpen(true);
      setCasesOpen(false);
    }
  }

  function closeMenu(kind: "services" | "products") {
    const timer = setTimeout(() => {
      if (kind === "services") setCasesOpen(false);
      else {
        setProductsOpen(false);
        setSelectedProductCat(null);
      }
    }, kind === "products" || kind === "services" ? 160 : 80);
    if (kind === "services") closeServicesTimer.current = timer;
    else closeProductsTimer.current = timer;
  }

  function handleMenuClick(e: MouseEvent, kind: "services" | "products") {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      const isOpen = kind === "services" ? casesOpen : productsOpen;
      if (isOpen) {
        if (kind === "services") setCasesOpen(false);
        else setProductsOpen(false);
      } else {
        openMenu(kind);
      }
    }
  }

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
    function handleClickOutside(e: globalThis.MouseEvent) {
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
    <header className="relative sticky top-[50px] md:top-0 z-40 border-b border-line bg-white shadow-[0_2px_12px_rgba(11,31,51,0.04)] w-full max-w-full">
      <div className="shell flex items-center justify-between py-2 md:py-2.5 gap-2 sm:gap-3 w-full max-w-full min-w-0">
        {/* Left: Logo & Company Name Branding (Slightly Larger) */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 md:shrink-0 mr-1 sm:mr-2 md:mr-4 lg:mr-6">
          <div className="shrink-0">
            <Logo size={58} src={site.logoUrl || (site as unknown as { logo?: string }).logo} />
          </div>
          <div className="flex flex-col justify-center min-w-0 md:min-w-max">
            <div className="font-display text-[16px] sm:text-[20px] md:text-[22px] xl:text-[24px] font-extrabold uppercase leading-none tracking-[0.02em] sm:tracking-[0.03em] whitespace-normal sm:whitespace-nowrap">
              <span className="text-navy">{(site.brandName || "NUR ENGINEERING SOLUTION").split(" ")[0]} </span>
              <span className="text-orange">{(site.brandName || "NUR ENGINEERING SOLUTION").split(" ").slice(1).join(" ")}</span>
            </div>
            <span className="mt-0.5 sm:mt-1 text-[9.5px] sm:text-[11px] md:text-[11.5px] font-medium leading-none tracking-tight text-steel whitespace-normal sm:whitespace-nowrap">
              {site.tagline || "Machine, spare parts and Technical service provider"}
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
                  onMouseEnter={() => openMenu("services")}
                  onMouseLeave={() => closeMenu("services")}
                >
                  <Link
                    href="/use-cases"
                    onClick={(e) => handleMenuClick(e, "services")}
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
                  {casesOpen && (
                    <div className="absolute top-full left-0 z-[60] w-max min-w-[240px] max-w-[min(92vw,22rem)] max-h-[min(72vh,calc(100dvh-5.5rem))] overflow-hidden border-t-2 border-orange bg-white shadow-[0_16px_36px_rgba(11,31,51,0.14)]">
                      <div
                        className="overflow-y-auto overscroll-contain px-4 py-3"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-y-2">
                          {navServices.map((service) => (
                            <Link
                              key={service.slug || service._id}
                              href={`/services/${service.slug}`}
                              className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-navy transition hover:text-orange"
                            >
                              <ServiceNavIcon label={`${service.title} ${service.slug}`} />
                              <span className="min-w-0">{service.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (isProducts) {
              return (
                <div
                  key={link.href}
                  className="relative shrink-0"
                  onMouseEnter={() => openMenu("products")}
                  onMouseLeave={() => closeMenu("products")}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => handleMenuClick(e, "products")}
                    className={`relative flex items-center gap-1 py-3.5 font-display text-[14px] lg:text-[14.5px] xl:text-[15px] font-bold uppercase tracking-[0.05em] whitespace-nowrap shrink-0 transition ${
                      active
                        ? "text-orange"
                        : "text-navy hover:text-orange"
                    }`}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={productsOpen}
                  >
                    <span>{link.label}</span>
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      className="h-3 w-3 fill-none stroke-current opacity-70 shrink-0"
                      strokeWidth="2.5"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                    {active && (
                      <span className="absolute bottom-1 left-0 h-[2.5px] w-full bg-orange" />
                    )}
                  </Link>
                  {productsOpen && (
                    <div className="absolute top-full left-0 z-[60] flex max-h-[min(72vh,calc(100dvh-5.5rem))] overflow-hidden border-t-2 border-orange bg-white shadow-[0_16px_36px_rgba(11,31,51,0.14)]">
                      <div
                        className="min-w-[220px] max-w-[280px] overflow-y-auto overscroll-contain py-2"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {navCatalog.map((cat) => {
                          const selected = selectedProductCat === cat.slug;
                          return (
                            <button
                              key={cat.slug}
                              type="button"
                              onMouseEnter={() => {
                                setSelectedProductCat(cat.subcategories.length ? cat.slug : null);
                              }}
                              onClick={() => {
                                if (!cat.subcategories.length) {
                                  router.push(`/products?category=${encodeURIComponent(cat.slug)}`);
                                  setProductsOpen(false);
                                  setSelectedProductCat(null);
                                  return;
                                }
                                setSelectedProductCat(selected ? null : cat.slug);
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-semibold leading-snug transition ${
                                selected ? "bg-paper text-orange" : "text-navy hover:bg-paper hover:text-orange"
                              }`}
                            >
                              <CategoryNavIcon label={`${cat.name} ${cat.slug}`} />
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                      {selectedProductCat && (
                        <div
                          className="min-w-[220px] max-w-[300px] overflow-y-auto overscroll-contain border-l border-line py-2"
                          onMouseEnter={() => openMenu("products")}
                          onWheel={(e) => e.stopPropagation()}
                        >
                          {(navCatalog.find((c) => c.slug === selectedProductCat)?.subcategories || []).map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/products?category=${encodeURIComponent(selectedProductCat)}&subcategory=${encodeURIComponent(sub.slug)}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-[13px] leading-snug text-navy transition hover:bg-paper hover:text-orange"
                            >
                              <CategoryNavIcon label={`${sub.name} ${sub.slug}`} />
                              <span>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
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
              className="flex items-center rounded-[2px] border-2 border-navy bg-white overflow-hidden h-[34px] md:h-[36px] w-[180px] md:w-[195px] lg:w-[300px] xl:w-[340px] shadow-[0_1px_2px_rgba(11,31,51,0.06)] transition focus-within:border-orange shrink-0"
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
                className="header-live-search-input w-full h-full bg-transparent border-0 px-2.5 text-[11.5px] md:text-xs text-navy placeholder:text-steel/70 placeholder:font-normal min-w-0 appearance-none shadow-none ring-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:shadow-none focus:border-0"
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
              className="header-live-search-input w-full h-full bg-transparent border-0 px-2.5 text-xs text-navy placeholder:text-steel/70 min-w-0 appearance-none shadow-none ring-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:shadow-none focus:border-0"
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
              const isProducts = link.href === "/products";
              const isUseCases = link.href === "/use-cases";

              if (isProducts) {
                return (
                  <div key={link.href}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between py-3 font-display text-[14px] font-bold uppercase tracking-wider transition ${
                        productsOpen || active ? "text-orange" : "text-navy"
                      }`}
                      onClick={() => setProductsOpen((v) => !v)}
                    >
                      <span>{link.label}</span>
                    </button>
                    {productsOpen && (
                      <div className="pb-3 space-y-1">
                        {navCatalog.map((cat) => (
                          <div key={cat.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                if (!cat.subcategories.length) {
                                  router.push(`/products?category=${encodeURIComponent(cat.slug)}`);
                                  setOpen(false);
                                  return;
                                }
                                setSelectedProductCat((prev) => (prev === cat.slug ? null : cat.slug));
                              }}
                              className={`flex w-full items-center gap-2 py-1 text-left text-[13px] font-semibold ${
                                selectedProductCat === cat.slug ? "text-orange" : "text-navy"
                              }`}
                            >
                              <CategoryNavIcon label={`${cat.name} ${cat.slug}`} />
                              <span>{cat.name}</span>
                            </button>
                            {selectedProductCat === cat.slug &&
                              cat.subcategories.map((sub) => (
                                <Link
                                  key={sub.slug}
                                  href={`/products?category=${encodeURIComponent(cat.slug)}&subcategory=${encodeURIComponent(sub.slug)}`}
                                  onClick={() => setOpen(false)}
                                  className="flex items-center gap-2 py-1 pl-6 text-[12px] text-steel"
                                >
                                  <CategoryNavIcon label={`${sub.name} ${sub.slug}`} />
                                  <span>{sub.name}</span>
                                </Link>
                              ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              if (isUseCases) {
                return (
                  <div key={link.href}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between py-3 font-display text-[14px] font-bold uppercase tracking-wider transition ${
                        casesOpen || active ? "text-orange" : "text-navy"
                      }`}
                      onClick={() => setCasesOpen((v) => !v)}
                    >
                      <span>{link.label}</span>
                    </button>
                    {casesOpen && (
                      <div className="pb-3 space-y-2">
                        {navServices.map((service) => (
                          <Link
                            key={service.slug || service._id}
                            href={`/services/${service.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 py-0.5 text-[13px] font-medium text-navy"
                          >
                            <ServiceNavIcon label={`${service.title} ${service.slug}`} />
                            <span>{service.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

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

function ServiceNavIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  const kind = key.includes("plc") || key.includes("program")
    ? "plc"
    : key.includes("motor") || key.includes("drive")
      ? "motor"
      : key.includes("panel") || key.includes("control")
        ? "panel"
        : key.includes("sensor") || key.includes("automation")
          ? "sensor"
          : key.includes("spare") || key.includes("sourc") || key.includes("parts")
            ? "parts"
            : key.includes("robot")
              ? "robot"
              : key.includes("install") || key.includes("factory")
                ? "factory"
                : key.includes("technical") || key.includes("service")
                  ? "tool"
                  : key.includes("machin")
                    ? "machine"
                    : "gear";

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 fill-none stroke-current text-orange"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === "plc" && (
        <>
          <rect x="6" y="3" width="12" height="6" rx="1" />
          <rect x="5" y="11" width="14" height="10" rx="1.5" />
          <path d="M9 15h6M9 18h4" />
        </>
      )}
      {kind === "motor" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" />
        </>
      )}
      {kind === "panel" && (
        <>
          <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
          <path d="M8 9h2.5M8 13h2.5M14 9h3.5M14 13h3.5M8 17h8" />
        </>
      )}
      {kind === "sensor" && (
        <>
          <circle cx="12" cy="14" r="4" />
          <path d="M12 4v3M6.2 7.2l2 2M17.8 7.2l-2 2" />
        </>
      )}
      {kind === "parts" && (
        <>
          <path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5z" />
          <path d="M3.5 12.2 12 16.7l8.5-4.5M3.5 15.8 12 20.3l8.5-4.5" />
        </>
      )}
      {kind === "robot" && (
        <>
          <rect x="7" y="8" width="10" height="9" rx="1.5" />
          <path d="M12 8V5M9 21v-2.5M15 21v-2.5M5 12.5h2M17 12.5h2" />
          <circle cx="10" cy="12.5" r="0.8" fill="currentColor" />
          <circle cx="14" cy="12.5" r="0.8" fill="currentColor" />
        </>
      )}
      {kind === "factory" && <path d="M3 21V10l5 3.5V10l5 3.5V6l6 4v11H3z" />}
      {kind === "tool" && (
        <path d="M14.7 6.3a3.8 3.8 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a3.8 3.8 0 0 0 5.4-5.4l-2.1 2.1-3-3 2.1-2.1z" />
      )}
      {kind === "machine" && (
        <>
          <rect x="3.5" y="9" width="17" height="10" rx="1.2" />
          <path d="M8 9V6h8v3M8.5 14h7" />
        </>
      )}
      {kind === "gear" && (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2.4M12 18.1v2.4M4.4 7.1l1.8 1.8M17.8 15.1l1.8 1.8M3.5 12h2.4M18.1 12h2.4M4.4 16.9l1.8-1.8M17.8 8.9l1.8-1.8" />
        </>
      )}
    </svg>
  );
}

function CategoryNavIcon({ label }: { label: string }) {
  return <ServiceNavIcon label={label} />;
}

