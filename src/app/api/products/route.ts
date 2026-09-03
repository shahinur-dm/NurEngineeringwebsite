import { NextRequest } from "next/server";
import { getProducts } from "@/lib/data";
import { jsonOk, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const featured = searchParams.get("featured") === "true";
    const categorySlug = searchParams.get("category") || undefined;
    const q = searchParams.get("q") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const data = await getProducts({ featured, categorySlug, q, limit });
    return jsonOk(data);
  } catch (e) {
    console.error("GET /api/products error:", e);
    return jsonError("Failed to fetch products");
  }
}

