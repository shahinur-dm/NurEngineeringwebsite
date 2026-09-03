import { NextResponse } from "next/server";
import { getSubCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const subcategories = await getSubCategories(category);
    return NextResponse.json({ subcategories });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}
