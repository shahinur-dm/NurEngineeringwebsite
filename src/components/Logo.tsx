import Link from "next/link";

export function Logo({ size = 72 }: { size?: number }) {
  const ring = Math.max(2, Math.round(size * 0.04));
  return (
    <Link
      href="/"
      aria-label="Nur Engineering Solution home"
      className="relative grid shrink-0 place-items-center rounded-full bg-navy text-white"
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
    </Link>
  );
}
