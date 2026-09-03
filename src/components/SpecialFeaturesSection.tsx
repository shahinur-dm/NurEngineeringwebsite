"use client";

import { useState } from "react";
import type { IFeature } from "@/lib/models";

interface SpecialFeaturesSectionProps {
  features: IFeature[];
}

export function SpecialFeaturesSection({ features }: SpecialFeaturesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // If expanded, show all features; otherwise show first 9 (3 items per column across 3 columns)
  const visibleFeatures = expanded ? features : features.slice(0, 9);

  return (
    <section className="pt-0">
      <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-4">
        <div className="section-label mb-0">Special features</div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-1.5 pt-0.5 pb-0.5">
        {visibleFeatures.map((feat) => (
          <div
            key={String(feat._id || feat.slug || feat.name)}
            className="flex items-center gap-2 text-[12px] sm:text-[12.5px] text-navy font-medium leading-snug group"
          >
            <span className="text-emerald-600 font-bold text-xs shrink-0 select-none">
              ✓
            </span>
            <span className="truncate group-hover:text-orange transition-colors">
              {feat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
