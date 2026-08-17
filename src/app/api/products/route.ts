import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product, Category } from "@/lib/models";
import { jsonOk, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const filter: Record<string, unknown> = { published: true };
    if (searchParams.get("featured") === "true") filter.featured = true;
    const category = searchParams.get("category");
    if (category) {
      const cat = await Category.findOne({
        slug: category,
        type: "product",
      });
      if (cat) filter.category = cat._id;
    }
    const q = searchParams.get("q");
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
      ];
    }
    const data = await Product.find(filter)
      .populate("category")
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    return jsonOk(data);
  } catch (e) {
    console.error(e);
    return jsonError("Failed to fetch products");
  }
}
