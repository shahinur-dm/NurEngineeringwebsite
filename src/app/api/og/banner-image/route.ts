import { NextResponse } from "next/server";
import { getBanners } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const banners = await getBanners();
    const bannerImage =
      banners[0]?.image?.trim() ||
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80";

    // If it's a base64 data URI (data:image/jpeg;base64,...)
    if (bannerImage.startsWith("data:")) {
      const commaIdx = bannerImage.indexOf(",");
      if (commaIdx !== -1) {
        const header = bannerImage.substring(0, commaIdx);
        const base64Data = bannerImage.substring(commaIdx + 1);
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
    if (bannerImage.startsWith("http://") || bannerImage.startsWith("https://")) {
      return NextResponse.redirect(bannerImage, 307);
    }

    // If it's a relative path, redirect to absolute URL
    return NextResponse.redirect(new URL(bannerImage, req.url), 307);
  } catch (err) {
    console.error("OG banner image error:", err);
    return new NextResponse("Failed to load banner", { status: 500 });
  }
}
