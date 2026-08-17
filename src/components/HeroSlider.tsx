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
    <section className="relative min-h-[280px] overflow-hidden border border-line bg-navy md:min-h-[380px]">
      <Img
        src={slide.image}
        alt={slide.title}
        fill
        priority
        className="object-cover opacity-50"
        sizes="(max-width: 1024px) 100vw, 75vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/70 to-navy/10" />
      <div className="relative flex min-h-[280px] flex-col justify-center px-6 py-12 md:min-h-[380px] md:px-12">
        <p className="kicker text-orange-bright">Featured supply</p>
        <h1 className="mt-4 max-w-xl font-display text-[clamp(1.85rem,4vw,2.75rem)] font-bold uppercase leading-[0.95] tracking-[0.04em] text-white">
          {slide.title}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/72 md:text-[15px]">
          {slide.subtitle}
        </p>
        <Link href={slide.ctaHref} className="btn-orange mt-7 w-fit">
          {slide.ctaLabel}
        </Link>
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 md:flex">
            <button
              type="button"
              aria-label="Next slide"
              className="grid h-10 w-10 place-items-center border border-white/20 bg-navy/40 text-lg text-white backdrop-blur-sm transition hover:border-orange hover:bg-orange"
              onClick={() => go(1)}
            >
              ›
            </button>
            <button
              type="button"
              aria-label="Previous slide"
              className="grid h-10 w-10 place-items-center border border-white/20 bg-navy/40 text-lg text-white backdrop-blur-sm transition hover:border-orange hover:bg-orange"
              onClick={() => go(-1)}
            >
              ‹
            </button>
          </div>
          <div className="absolute bottom-5 left-6 flex items-center gap-3 md:left-12">
            <span className="font-display text-xs tracking-[0.16em] text-white/70">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              {slides.map((item, i) => (
                <button
                  key={String(item._id)}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  className={`h-0.5 rounded-full transition ${
                    i === index ? "w-8 bg-orange" : "w-3 bg-white/35"
                  }`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
