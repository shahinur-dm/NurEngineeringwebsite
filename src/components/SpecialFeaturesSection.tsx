"use client";

import Link from "next/link";
import { useState } from "react";
import type { ICategory, IFeature } from "@/lib/models";

interface SpecialFeaturesSectionProps {
  features: IFeature[];
  categories: ICategory[];
}

export function SpecialFeaturesSection({ features, categories }: SpecialFeaturesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // If expanded, show all features; otherwise show first 9 (3 items per column across 3 columns)
  const visibleFeatures = expanded ? features : features.slice(0, 9);

  return (
    <section className="pt-0">
      <div className="mb-1 sm:mb-1.5 flex items-center justify-between gap-4">
        <div className="section-label !mb-0">Special features</div>
        {features.length > 9 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange hover:text-navy transition flex items-center gap-1 cursor-pointer select-none shrink-0"
          >
            {expanded ? "Show less ←" : "See more →"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-1.5">
        {visibleFeatures.map((feat) => (
          <Link
            key={String(feat._id || feat.slug || feat.name)}
            href={featureHref(feat, categories)}
            className="flex items-center gap-1.5 text-[13.5px] sm:text-[14.5px] text-navy font-medium leading-none group min-w-0"
          >
            <FeatureItemIcon label={`${feat.name} ${feat.slug || ""}`} />
            <span className="truncate group-hover:text-orange transition-colors">
              {feat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function norm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function featureHref(feat: IFeature, categories: ICategory[]) {
  const slug = (feat.slug || "").toLowerCase();
  const name = norm(feat.name);

  const bySlug = categories.find((c) => {
    const cs = c.slug.toLowerCase();
    return slug === cs || slug.startsWith(`${cs}-`) || cs.startsWith(`${slug}-`);
  });
  if (bySlug) return `/products?category=${encodeURIComponent(bySlug.slug)}`;

  const byName = categories.find((c) => {
    const cn = norm(c.name);
    return cn === name || name.startsWith(cn) || cn.startsWith(name);
  });
  if (byName) return `/products?category=${encodeURIComponent(byName.slug)}`;

  const fTokens = name.split(" ").filter((w) => w.length > 2);
  let best: ICategory | undefined;
  let bestScore = 0;
  for (const c of categories) {
    const cTokens = norm(c.name).split(" ").filter((w) => w.length > 2);
    const score = fTokens.filter((t) =>
      cTokens.some((ct) => ct === t || ct.startsWith(t) || t.startsWith(ct))
    ).length;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  if (best && bestScore >= 2) {
    return `/products?category=${encodeURIComponent(best.slug)}`;
  }

  return `/products?q=${encodeURIComponent(feat.name)}`;
}

function FeatureItemIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  const kind = key.includes("injection") || key.includes("imm")
    ? "machine"
    : key.includes("blow") || key.includes("bmm") || key.includes("pet")
      ? "bottle"
      : key.includes("crusher")
        ? "crush"
        : key.includes("mixer")
          ? "mix"
          : key.includes("chiller") || key.includes("cool")
            ? "chill"
            : key.includes("robot")
              ? "robot"
              : key.includes("mould") || key.includes("mold")
                ? "mould"
                : key.includes("servo")
                  ? "servo"
                  : key.includes("plc") || key.includes("hmi")
                    ? "plc"
                    : key.includes("print") || key.includes("packag")
                      ? "pack"
                      : key.includes("heat")
                        ? "heat"
                        : key.includes("sensor") || key.includes("timer") || key.includes("counter")
                          ? "sensor"
                          : key.includes("compressor")
                            ? "air"
                            : key.includes("crane")
                              ? "crane"
                              : key.includes("hydraulic")
                                ? "hydro"
                                : key.includes("screw") || key.includes("barrel")
                                  ? "screw"
                                  : key.includes("auxil")
                                    ? "aux"
                                    : key.includes("automat")
                                      ? "auto"
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
      {kind === "machine" && (
        <>
          <rect x="3.5" y="9" width="17" height="10" rx="1.2" />
          <path d="M8 9V6h8v3M8.5 14h7" />
        </>
      )}
      {kind === "bottle" && (
        <path d="M10 2.8h4v2.7l1.8 2.8v11a2 2 0 0 1-2 2h-3.6a2 2 0 0 1-2-2V8.3L10 5.5z" />
      )}
      {kind === "crush" && (
        <path d="M4 13.5 8 9l4 4.5 4-4.5 4 4.5M4 18.5h16" />
      )}
      {kind === "mix" && (
        <>
          <path d="M8 3.5h8l-1.8 8.5H9.8L8 3.5z" />
          <path d="M9.8 12v6.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2V12" />
        </>
      )}
      {kind === "chill" && <path d="M12 3v18M5.2 7.2 18.8 16.8M18.8 7.2 5.2 16.8" />}
      {kind === "robot" && (
        <>
          <rect x="7" y="8" width="10" height="9" rx="1.5" />
          <path d="M12 8V5M9 21v-2.5M15 21v-2.5M5 12.5h2M17 12.5h2" />
          <circle cx="10" cy="12.5" r="0.75" fill="currentColor" />
          <circle cx="14" cy="12.5" r="0.75" fill="currentColor" />
        </>
      )}
      {kind === "mould" && (
        <>
          <rect x="4.5" y="8" width="15" height="11" rx="1.2" />
          <path d="M9 8V5h6v3M8 13.5h8" />
        </>
      )}
      {kind === "servo" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5.2l3.2 1.8" />
        </>
      )}
      {kind === "plc" && (
        <>
          <rect x="6" y="3" width="12" height="6" rx="1" />
          <rect x="5" y="11" width="14" height="10" rx="1.5" />
          <path d="M9 15h6M9 18h4" />
        </>
      )}
      {kind === "pack" && (
        <path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5zM3.5 12.2v5.1L12 21.8l8.5-4.5v-5.1" />
      )}
      {kind === "heat" && (
        <path d="M12 21a5 5 0 0 0 5-5.2c0-3.2-5-8.3-5-8.3S7 12.6 7 15.8A5 5 0 0 0 12 21z" />
      )}
      {kind === "sensor" && (
        <>
          <circle cx="12" cy="14" r="4" />
          <path d="M12 4v3M6.2 7.2l2 2M17.8 7.2l-2 2" />
        </>
      )}
      {kind === "air" && (
        <path d="M4 14.2h9.5a3 3 0 1 0-2.7-4H8.2M4 18h12.5a3 3 0 1 0 0-6" />
      )}
      {kind === "crane" && <path d="M3 21h18M6 21V8h12l-4.2 5.2H8M16 8V5" />}
      {kind === "hydro" && (
        <path d="M12 3s5.8 6.8 5.8 10.8a5.8 5.8 0 1 1-11.6 0C6.2 9.8 12 3 12 3z" />
      )}
      {kind === "screw" && <path d="M12 3v18M8 7h8M9 11.2h6M10 15.4h4" />}
      {kind === "aux" && (
        <>
          <rect x="3.5" y="8" width="7" height="7" rx="1" />
          <rect x="13.5" y="10" width="7" height="9" rx="1" />
          <path d="M7 15v4h4" />
        </>
      )}
      {kind === "auto" && (
        <path d="M5 16V8.2L12 4l7 4.2V16L12 20.2 5 16zM5 8.2 12 12.4 19 8.2M12 12.4V20" />
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
