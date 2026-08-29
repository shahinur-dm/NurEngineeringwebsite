import Link from "next/link";

export function Logo({
  size = 72,
  asLink = false,
  src,
}: {
  size?: number;
  asLink?: boolean;
  src?: string;
}) {
  const ring = Math.max(2, Math.round(size * 0.04));
  
  const badge = src ? (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full bg-white select-none"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 ${ring}px #0b1f33, 0 0 0 ${ring * 2}px #e56b12`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Nur Engineering Solution Logo"
        className="h-full w-full object-contain p-1"
      />
    </span>
  ) : (
    <span
      className="relative grid shrink-0 place-items-center rounded-full bg-navy text-white select-none"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 ${ring}px #0b1f33, 0 0 0 ${ring * 2}px #e56b12`,
      }}
    >
      <span
        className="font-display font-bold leading-none tracking-[0.04em]"
        style={{ fontSize: size * 0.34 }}
      >
        NES
      </span>
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" aria-label="Nur Engineering Solution home" className="inline-block">
        {badge}
      </Link>
    );
  }

  return badge;
}
