"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Img } from "@/components/Img";
import type { IBanner } from "@/lib/models";

export function HeroSlider({ banners }: { banners: IBanner[] }) {
  const slides = banners.length
    ? banners
    : [
        {
          _id: "fallback",
          title: "Machine parts & technical service",
          subtitle: "PLC, motors, drives, sensors and spare parts for EEE work.",
          image:
            "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80",
          ctaLabel: "View catalog",
          ctaHref: "/products",
          order: 1,
          active: true,
        },
      ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5600);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const slide = slides[index];
  const go = (dir: number) =>
    setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <section className="relative min-h-[190px] sm:min-h-[210px] md:min-h-[220px] lg:min-h-[230px] overflow-hidden border border-line bg-navy shadow-[0_1px_0_rgba(11,31,51,0.03)]">
      <Img
        src={slide.image}
        alt={slide.title}
        fill
        priority
        className="object-cover opacity-50"
        sizes="(max-width: 1024px) 100vw, 75vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/25" />

      {/* Main Content Area */}
      <div className="relative flex min-h-[190px] sm:min-h-[210px] md:min-h-[220px] lg:min-h-[230px] flex-col justify-center px-4 py-4 sm:px-8 md:px-10 md:py-5">
        <p className="kicker text-[10px] sm:text-[10.5px] tracking-[0.16em] text-orange-bright">
          Featured supply
        </p>
        <h1 className="mt-1 max-w-xl font-display text-[clamp(1.15rem,2.8vw,1.85rem)] font-bold uppercase leading-[1.1] tracking-[0.03em] text-white">
          {slide.title}
        </h1>
        <p className="mt-1.5 max-w-lg text-[11.5px] sm:text-[12px] leading-relaxed text-white/80 md:text-[13px] line-clamp-2 sm:line-clamp-none">
          {slide.subtitle}
        </p>

        {/* CTA button & Slide Indicators */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3.5 sm:gap-6">
          <Link
            href={slide.ctaHref}
            className="btn-orange h-9 sm:h-8 min-h-[2.25rem] sm:min-h-[2rem] px-4 py-1.5 sm:py-1 text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            {slide.ctaLabel}
          </Link>

          {slides.length > 1 && (
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[11px] font-semibold tracking-[0.14em] text-white/60">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1.5">
                {slides.map((item, i) => (
                  <button
                    key={String(item._id)}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1 sm:h-0.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-orange" : "w-2.5 bg-white/35"
                    }`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      {slides.length > 1 && (
        <div className="absolute right-3.5 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-1.5 md:flex">
          <button
            type="button"
            aria-label="Next slide"
            className="grid h-8 w-8 place-items-center border border-white/20 bg-navy/50 text-sm text-white backdrop-blur-sm transition hover:border-orange hover:bg-orange cursor-pointer"
            onClick={() => go(1)}
          >
            ›
          </button>
          <button
            type="button"
            aria-label="Previous slide"
            className="grid h-8 w-8 place-items-center border border-white/20 bg-navy/50 text-sm text-white backdrop-blur-sm transition hover:border-orange hover:bg-orange cursor-pointer"
            onClick={() => go(-1)}
          >
            ‹
          </button>
        </div>
      )}
    </section>
  );
}
