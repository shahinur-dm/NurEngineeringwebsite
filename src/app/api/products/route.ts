import { NextRequest, NextResponse } from "next/server";
import { getProducts, getProductsTotalCount } from "@/lib/data";
import { jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const featured = searchParams.get("featured") === "true";
    const categorySlug = searchParams.get("category") || undefined;
    const subCategorySlug = searchParams.get("subcategory") || searchParams.get("subCategory") || undefined;
    const q = searchParams.get("q") || undefined;
    const limitParam = searchParams.get("limit");
    const rawLimit = limitParam ? parseInt(limitParam, 10) : undefined;
    // Bound limit safely between 1 and 60
    const limit = rawLimit ? Math.max(1, Math.min(rawLimit, 60)) : (searchParams.has("page") ? 20 : undefined);
    const pageParam = searchParams.get("page");
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

    const [data, total] = await Promise.all([
      getProducts({ featured, categorySlug, subCategorySlug, q, limit, page }),
      getProductsTotalCount({ featured, categorySlug, subCategorySlug, q }),
    ]);

    const effectiveLimit = limit || data.length || 20;
    const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit: effectiveLimit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (e) {
    console.error("GET /api/products error:", e);
    return jsonError("Failed to fetch products");
  }
}
