import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return new NextResponse("Product slug is required", { status: 400 });
    }

    const product = await getProductBySlug(slug);
    if (!product || !product.image) {
      return new NextResponse("Product not found or has no image", { status: 404 });
    }

    const rawImage = product.image.trim();

    // If it's a base64 data URI (data:image/jpeg;base64,...)
    if (rawImage.startsWith("data:")) {
      const commaIdx = rawImage.indexOf(",");
      if (commaIdx !== -1) {
        const header = rawImage.substring(0, commaIdx);
        const base64Data = rawImage.substring(commaIdx + 1);
        const mimeMatch = header.match(/^data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const buffer = Buffer.from(base64Data, "base64");
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Content-Length": String(buffer.length),
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    // If it's an external HTTP/HTTPS URL, redirect with 307
    if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
      return NextResponse.redirect(rawImage, 307);
    }

    // If it's a relative path, redirect to absolute URL
    return NextResponse.redirect(new URL(rawImage, req.url), 307);
  } catch (err) {
    console.error("OG product image error:", err);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}
