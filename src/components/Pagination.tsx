import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  queryParams?: Record<string, string | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/",
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val && key !== "page") params.set(key, val);
    });
    if (page > 1) {
      params.set("page", String(page));
    }
    const queryStr = params.toString();
    return queryStr ? `${basePath}?${queryStr}` : basePath;
  };

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2.5 pb-0.5"
    >
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border border-line bg-white text-navy hover:border-orange hover:text-orange transition rounded-[2px]"
        >
          ← PREV
        </Link>
      )}

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <Link
            key={p}
            href={createPageUrl(p)}
            className={`min-w-[30px] sm:min-w-[34px] h-7 sm:h-8 px-2 flex items-center justify-center text-[12px] sm:text-[13px] font-bold transition rounded-[2px] ${
              isActive
                ? "bg-navy text-white border border-navy shadow-xs"
                : "bg-white text-navy border border-line hover:border-orange hover:text-orange"
            }`}
          >
            {p}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-2.5 sm:px-3 py-1 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border border-line bg-white text-navy hover:border-orange hover:text-orange transition rounded-[2px]"
        >
          NEXT →
        </Link>
      )}
    </nav>
  );
}
