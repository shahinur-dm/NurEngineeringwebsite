"use client";

import { useState } from "react";
import Link from "next/link";
import type { ICategory } from "@/lib/models";

export function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: ICategory[];
  activeSlug?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <>
      {/* Mobile Collapsible Category Accordion / Dropdown */}
      <div className="block lg:hidden border border-line bg-white shadow-[0_1px_0_rgba(11,31,51,0.03)]">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between bg-navy px-4 py-3 text-left transition"
          aria-expanded={mobileOpen}
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-white">
              Category
            </span>
            {activeCategory ? (
              <span className="rounded bg-orange px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                {activeCategory.name}
              </span>
            ) : (
              <span className="rounded bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase text-white/90">
                All Products
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-orange font-bold">
            <span>{mobileOpen ? "Hide" : "Filter"}</span>
            <span className="text-sm">{mobileOpen ? "▲" : "▼"}</span>
          </span>
        </button>

        {mobileOpen && (
          <div className="border-t border-line divide-y divide-line/70 max-h-[320px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-4 py-2 text-[12.5px] transition ${
                !activeSlug
                  ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-semibold text-navy"
                  : "border-l-[3px] border-l-transparent text-steel hover:bg-paper hover:text-navy"
              }`}
            >
              <span>All products</span>
              {!activeSlug && <span className="text-orange font-bold text-xs">✓</span>}
            </Link>
            {categories.map((cat) => {
              const active = activeSlug === cat.slug;
              return (
                <Link
                  key={String(cat._id)}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-2 text-[12.5px] transition ${
                    active
                      ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-semibold text-navy"
                      : "border-l-[3px] border-l-transparent text-steel hover:bg-paper hover:text-navy"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {active && <span className="text-orange font-bold text-xs">✓</span>}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block bg-navy/95 px-4 py-2.5 text-center font-display text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-orange"
            >
              Need a part quote? Contact Us →
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Category Sidebar (Narrower with Clean Scrollbar) */}
      <aside className="hidden lg:block overflow-hidden border border-line bg-white shadow-[0_1px_0_rgba(11,31,51,0.03)] rounded-[2px]">
        <div className="flex items-center justify-between bg-navy px-3 py-2.5">
          <p className="font-display text-[12px] font-bold uppercase tracking-[0.14em] text-white">
            Category
          </p>
          <span className="h-px w-6 bg-orange" />
        </div>
        <ul className="max-h-[380px] xl:max-h-[420px] overflow-y-auto divide-y divide-line/60 scrollbar-thin">
          <li>
            <Link
              href="/products"
              className={`flex items-center justify-between px-3 py-2 text-[11.5px] xl:text-[12px] leading-tight transition ${
                !activeSlug
                  ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-bold text-navy"
                  : "border-l-[3px] border-l-transparent font-medium text-steel hover:bg-paper hover:text-navy"
              }`}
            >
              <span className="truncate">All products</span>
            </Link>
          </li>
          {categories.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <li key={String(cat._id)}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`flex items-center justify-between px-3 py-2 text-[11.5px] xl:text-[12px] leading-tight transition ${
                    active
                      ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-bold text-navy"
                      : "border-l-[3px] border-l-transparent font-medium text-steel hover:bg-paper hover:text-navy"
                  }`}
                  title={cat.name}
                >
                  <span className="truncate">{cat.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/contact"
          className="block bg-navy px-3 py-2 text-center font-display text-[11.5px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-orange"
        >
          Contact
        </Link>
      </aside>
    </>
  );
}
