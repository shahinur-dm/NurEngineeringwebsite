import { NextResponse } from "next/server";
import { getBrands } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json(
      { success: true, brands },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Public brands GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load brands" },
      { status: 500 }
    );
  }
}
