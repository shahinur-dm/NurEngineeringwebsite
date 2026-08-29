"use client";

import { useState } from "react";
import { Img } from "@/components/Img";
import { youtubeId } from "@/lib/product-media";

type Item =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string; id: string; thumb: string };

export function ProductGallery({
  name,
  images,
  videoUrl,
}: {
  name: string;
  images: string[];
  videoUrl?: string;
}) {
  const yt = youtubeId(videoUrl);
  const isFile = Boolean(videoUrl && /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl));

  const items: Item[] = [
    ...images.filter(Boolean).map((src) => ({ kind: "image" as const, src })),
    ...(yt
      ? [
          {
            kind: "video" as const,
            src: videoUrl!,
            id: yt,
            thumb: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
          },
        ]
      : []),
    ...(isFile && videoUrl && !yt
      ? [
          {
            kind: "video" as const,
            src: videoUrl,
            id: "file",
            thumb: images[0],
          },
        ]
      : []),
  ];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = items[active] || items[0];
  if (!current) return null;

  const imageCount = items.filter((item) => item.kind === "image").length;

  function select(index: number) {
    setActive(index);
    setPlaying(false);
  }

  function go(dir: number) {
    setActive((i) => (i + dir + items.length) % items.length);
    setPlaying(false);
  }

  return (
    <div>
      <div className="image-frame relative aspect-[4/3] border border-line bg-navy">
        {current.kind === "image" ? (
          <Img
            src={current.src}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : playing && yt && current.id !== "file" ? (
          <iframe
            title={`${name} video`}
            src={`https://www.youtube-nocookie.com/embed/${current.id}?rel=0&autoplay=1`}
            className="absolute inset-0 z-[2] h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : playing && current.id === "file" ? (
          <video
            className="absolute inset-0 z-[2] h-full w-full object-cover"
            src={current.src}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <>
            <Img
              src={current.thumb || images[0]}
              alt={`${name} video`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 z-[2] grid place-items-center bg-navy/25 transition hover:bg-navy/15"
              aria-label="Play video"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-orange text-white shadow-lg">
                ▶
              </span>
            </button>
          </>
        )}

        {items.length > 1 && !playing && (
          <>
            <button
              type="button"
              aria-label="Previous"
              className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center bg-navy/55 text-white backdrop-blur-sm transition hover:bg-orange"
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center bg-navy/55 text-white backdrop-blur-sm transition hover:bg-orange"
              onClick={() => go(1)}
            >
              ›
            </button>
          </>
        )}

        <div className="absolute bottom-3 left-3 z-10 bg-navy/70 px-2 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {current.kind === "video"
            ? playing
              ? "Playing"
              : "Video"
            : `${String(active + 1).padStart(2, "0")} / ${String(imageCount).padStart(2, "0")}`}
        </div>
      </div>

      {items.length > 1 && (
        <div className="mt-2.5 grid grid-cols-5 gap-2">
          {items.map((item, i) => (
            <button
              key={`${item.kind}-${item.src}-${i}`}
              type="button"
              onClick={() => select(i)}
              className={`relative aspect-square overflow-hidden border transition ${
                i === active
                  ? "border-orange"
                  : "border-line hover:border-navy/30"
              }`}
              aria-label={item.kind === "video" ? "Play video" : `Image ${i + 1}`}
            >
              <Img
                src={item.kind === "video" ? item.thumb || images[0] : item.src}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
              {item.kind === "video" && (
                <span className="absolute inset-0 grid place-items-center bg-navy/35">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-orange text-[10px] text-white">
                    ▶
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
