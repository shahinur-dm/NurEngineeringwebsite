import { Suspense, type ReactNode } from "react";
import { CategorySidebar } from "@/components/CategorySidebar";
import { SearchBar } from "@/components/SearchBar";
import type { ICategory } from "@/lib/models";

export function CatalogShell({
  categories,
  activeSlug,
  children,
  showSearch = true,
}: {
  categories: ICategory[];
  activeSlug?: string;
  children: ReactNode;
  showSearch?: boolean;
}) {
  return (
    <div className="shell grid gap-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-4 lg:self-start">
        <CategorySidebar categories={categories} activeSlug={activeSlug} />
      </div>
      <div className="min-w-0 space-y-6">
        {showSearch && (
          <Suspense fallback={<div className="h-12 border border-line bg-white" />}>
            <SearchBar />
          </Suspense>
        )}
        {children}
      </div>
    </div>
  );
}
