import { Suspense, type ReactNode } from "react";
import { CategorySidebar } from "@/components/CategorySidebar";
import { SearchBar } from "@/components/SearchBar";
import type { ICategory } from "@/lib/models";

export function CatalogShell({
  categories,
  activeSlug,
  children,
}: {
  categories: ICategory[];
  activeSlug?: string;
  children: ReactNode;
  showSearch?: boolean;
}) {
  return (
    <div className="shell grid gap-3.5 sm:gap-4 pt-1.5 sm:pt-2 pb-6 sm:pb-8 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-16 lg:self-start z-30 relative">
        <CategorySidebar categories={categories} activeSlug={activeSlug} />
      </div>
      <div className="min-w-0 space-y-2.5 sm:space-y-3">
        {children}
      </div>
    </div>
  );
}
