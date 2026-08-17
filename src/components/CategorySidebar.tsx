import Link from "next/link";
import type { ICategory } from "@/lib/models";

export function CategorySidebar({
  categories,
  activeSlug,
}: {
  categories: ICategory[];
  activeSlug?: string;
}) {
  return (
    <aside className="overflow-hidden border border-line bg-white shadow-[0_1px_0_rgba(11,31,51,0.03)]">
      <div className="flex items-center justify-between bg-navy px-4 py-3">
        <p className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-white">
          Category
        </p>
        <span className="h-px w-8 bg-orange" />
      </div>
      <ul>
        <li>
          <Link
            href="/products"
            className={`flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] transition ${
              !activeSlug
                ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-semibold text-navy"
                : "border-l-[3px] border-l-transparent text-steel hover:bg-paper hover:text-navy"
            }`}
          >
            All products
          </Link>
        </li>
        {categories.map((cat) => {
          const active = activeSlug === cat.slug;
          return (
            <li key={String(cat._id)}>
              <Link
                href={`/products?category=${cat.slug}`}
                className={`flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] transition ${
                  active
                    ? "border-l-[3px] border-l-orange bg-[#fff7f1] font-semibold text-navy"
                    : "border-l-[3px] border-l-transparent text-steel hover:bg-paper hover:text-navy"
                }`}
              >
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/contact"
        className="block bg-navy px-4 py-3.5 text-center font-display text-[13px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-navy-mid"
      >
        Contact
      </Link>
    </aside>
  );
}
