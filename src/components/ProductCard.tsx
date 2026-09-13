import Link from "next/link";
import { Img } from "@/components/Img";
import type { PopulatedProduct } from "@/lib/data";

export function ProductCard({
  product,
  size = "md",
}: {
  product: PopulatedProduct;
  size?: "lg" | "md" | "sm";
}) {
  const aspect =
    size === "lg"
      ? "aspect-[4/3.6]"
      : size === "sm"
      ? "aspect-[1/1.08]"
      : "aspect-[1/1.05]";
  const category =
    typeof product.category === "object" ? product.category.name : "";

  return (
    <div className="catalog-card group flex flex-col h-full bg-white border border-line rounded-[2px] shadow-xs hover:border-orange/60 hover:shadow-sm transition">
      {/* 1. Product Image Frame */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden shrink-0">
        <div className={`image-frame relative w-full ${aspect} bg-paper/50`}>
          <Img
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.045]"
          />
          {product.featured && size !== "sm" && (
            <span className="absolute left-2.5 top-2.5 z-10 bg-orange px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Featured
            </span>
          )}
        </div>
      </Link>

      {/* 2. Product Information & Action Buttons */}
      <div className="flex-1 flex flex-col justify-between p-2 sm:p-2.5">
        {/* Title and Category */}
        <Link href={`/products/${product.slug}`} className="block mb-2 sm:mb-2.5">
          <p className="kicker text-[10px] sm:text-[11px] truncate text-orange font-bold uppercase tracking-wider">
            {category || "Industrial Machine Parts"}
          </p>
          <h3
            className={`mt-1 font-display font-bold uppercase leading-snug tracking-wide text-navy transition group-hover:text-orange line-clamp-2 min-h-[2.6em] ${
              size === "sm" ? "text-[12px] sm:text-[13px]" : "text-[13px] sm:text-[14px]"
            }`}
            title={product.name}
          >
            {product.name}
          </h3>
          {size !== "sm" && product.shortDescription && (
            <p className="mt-1 hidden sm:line-clamp-2 text-[11.5px] leading-relaxed text-steel">
              {product.shortDescription}
            </p>
          )}
        </Link>

        {/* 3. Action Buttons: ASK PRICE (Orange) & VIEW DETAILS (Green) */}
        <div className="pt-2 sm:pt-2.5 border-t border-line mt-auto flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* ASK PRICE (Orange) */}
          <Link
            href={`/contact?product=${product.slug}`}
            className="flex-1 min-w-0 inline-flex items-center justify-center bg-orange font-display font-bold uppercase text-white transition hover:bg-[#e05300] active:scale-95 shadow-2xs h-8 sm:h-9 px-1.5 sm:px-2 text-[12.5px] sm:text-[14px] tracking-[0.04em] rounded-[2px] text-center leading-none"
            title={`Ask price for ${product.name}`}
          >
            <span className="whitespace-nowrap">ASK PRICE</span>
          </Link>

          {/* VIEW DETAILS (Green) */}
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 min-w-0 inline-flex items-center justify-center bg-[#16a34a] font-display font-bold uppercase text-white transition hover:bg-[#15803d] active:scale-95 shadow-2xs h-8 sm:h-9 px-1.5 sm:px-2 text-[12.5px] sm:text-[14px] tracking-[0.04em] rounded-[2px] text-center leading-none"
            title={`View details for ${product.name}`}
          >
            <span className="whitespace-nowrap">VIEW DETAILS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
