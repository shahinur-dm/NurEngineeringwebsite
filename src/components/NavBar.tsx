"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSite, useUseCases } from "@/components/SiteProvider";

export function NavBar() {
  const site = useSite();
  const useCases = useUseCases();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [casesOpen, setCasesOpen] = useState(false);
  const nav = [...(site.nav || [])].sort((a, b) => a.order - b.order);

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

  return (
    <nav className="relative z-40 bg-navy">
      <div className="shell">
        <button
          type="button"
          className="flex w-full items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
          <span aria-hidden>{open ? "−" : "+"}</span>
        </button>
        <div className={`${open ? "flex" : "hidden"} flex-col md:flex md:flex-row`}>
          {nav.map((link) => {
            if (link.href === "/use-cases") {
              return (
                <div
                  key={link.href}
                  className="relative md:flex-1"
                  onMouseEnter={() => setCasesOpen(true)}
                  onMouseLeave={() => setCasesOpen(false)}
                >
                  <Link
                    href="/use-cases"
                    className="nav-seg w-full justify-start py-3 md:justify-center md:py-0"
                    aria-current={isActive(link.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    aria-expanded={casesOpen}
                  >
                    {link.label}
                  </Link>
                  <div className="border-t border-white/10 bg-navy-mid md:hidden">
                    {useCases.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/use-cases/${item.slug}`}
                        className="block px-5 py-2.5 text-[11px] uppercase tracking-[0.12em] text-white/75 hover:bg-orange hover:text-white"
                        onClick={() => setOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                  {casesOpen && (
                    <div className="absolute top-full left-0 z-50 hidden border-t-2 border-orange bg-white shadow-[0_28px_60px_rgba(11,31,51,0.16)] md:block" style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}>
                      <div className="shell py-7">
                        <div className="mb-5 flex items-end justify-between gap-4">
                          <div>
                            <p className="kicker">Company use cases</p>
                            <p className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em] text-navy">
                              How this parts desk is actually used
                            </p>
                          </div>
                          <Link
                            href="/use-cases"
                            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange hover:text-navy"
                          >
                            View all notes →
                          </Link>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          {useCases.map((item) => (
                            <Link
                              key={item.slug}
                              href={`/use-cases/${item.slug}`}
                              className="catalog-card group p-4"
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange">
                                {item.industry}
                              </p>
                              <h3 className="mt-2 font-display text-lg font-bold uppercase leading-tight text-navy group-hover:text-orange">
                                {item.title}
                              </h3>
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-steel">
                                {item.summary}
                              </p>
                            </Link>
                          ))}
                        </div>
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
                className="nav-seg justify-start py-3 md:justify-center md:py-0"
                aria-current={isActive(link.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
