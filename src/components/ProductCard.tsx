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
    size === "lg" ? "aspect-[5/4]" : size === "sm" ? "aspect-square" : "aspect-[4/3]";
  const category =
    typeof product.category === "object" ? product.category.name : "";

  return (
    <div className="catalog-card group flex flex-col justify-between">
      <Link href={`/products/${product.slug}`} className="block">
        <div className={`image-frame relative ${aspect}`}>
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
        <div className={size === "sm" ? "p-2.5 sm:p-3 pb-0" : "p-3 sm:px-3.5 sm:pt-3.5 pb-0"}>
          <p className="kicker text-[9.5px] sm:text-[11px] truncate">{category}</p>
          <h3
            className={`mt-1 font-display font-bold uppercase leading-snug tracking-wide text-navy transition group-hover:text-orange line-clamp-2 ${
              size === "sm" ? "text-[12px] sm:text-[13px]" : "text-[13px] sm:text-[15px]"
            }`}
          >
            {product.name}
          </h3>
          {size !== "sm" && (
            <p className="mt-1.5 hidden sm:line-clamp-2 text-[12px] leading-5 text-steel">
              {product.shortDescription}
            </p>
          )}
        </div>
      </Link>

      <div className={size === "sm" ? "p-2.5 pt-2.5 sm:p-3 sm:pt-3" : "p-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3"}>
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 border-t border-line pt-2">
          <Link
            href={`/contact?product=${product.slug}`}
            className={`inline-flex items-center justify-center bg-orange font-display font-bold uppercase text-white transition hover:bg-[#e05300] active:scale-95 shadow-2xs shrink-0 ${
              size === "sm"
                ? "px-2 py-1 text-[9.5px] sm:text-[10px] tracking-[0.05em]"
                : "px-2.5 sm:px-3 py-1 sm:py-1 text-[10px] sm:text-[10.5px] tracking-[0.06em] sm:tracking-[0.08em]"
            }`}
            title={`Ask price for ${product.name}`}
          >
            Ask Price
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange hover:text-navy transition shrink-0"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
