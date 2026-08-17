import Link from "next/link";
import { Img } from "@/components/Img";
import { formatPrice } from "@/lib/format";
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
    <Link href={`/products/${product.slug}`} className="catalog-card group block">
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
      <div className={size === "sm" ? "p-3" : "px-3.5 py-3.5"}>
        <p className="kicker">{category}</p>
        <h3
          className={`mt-1.5 font-display font-bold uppercase leading-snug tracking-wide text-navy transition group-hover:text-orange ${
            size === "sm" ? "text-[13px]" : "text-[15px]"
          }`}
        >
          {product.name}
        </h3>
        {size !== "sm" && (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-steel">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-line pt-2.5">
          <p className={`font-semibold text-navy ${size === "sm" ? "text-xs" : "text-sm"}`}>
            {formatPrice(product.price, product.currency)}
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
