import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { mockProducts, mockCategories } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const stock = url.searchParams.get("stock");
  const published = url.searchParams.get("published");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10));

  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = {};

      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: "i" } },
          { sku: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
        ];
      }
      if (category) filter.category = category;
      if (stock === "in") filter.inStock = true;
      if (stock === "out") filter.inStock = false;
      if (published === "true") filter.published = true;
      if (published === "false") filter.published = false;

      const [items, total] = await Promise.all([
        Product.find(filter)
          .populate("category", "name slug")
          .sort({ order: 1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter),
      ]);

      return NextResponse.json({
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (err) {
    console.warn("Fetch products DB error, using fallback catalog:", err);
  }

  // Fallback to mock products
  const catMap = new Map(mockCategories.map((c) => [String(c._id), c]));
  let list = mockProducts.map((p) => ({
    ...p,
    category: catMap.get(String(p.category)) || { name: "General", slug: "general" },
  }));

  if (q) {
    const lq = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(lq) ||
        (p.sku ? p.sku.toLowerCase().includes(lq) : false)
    );
  }

  return NextResponse.json({
    items: list.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: list.length,
      pages: Math.ceil(list.length / limit),
    },
  });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    await connectDB();

    // Auto-generate slug if not provided
    let slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check slug uniqueness
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newProduct = await Product.create({
      ...body,
      slug,
      gallery: body.gallery || [],
      specs: body.specs || [],
      relatedServices: body.relatedServices || [],
    });

    await logActivity({
      action: "PRODUCT_CREATE",
      entity: "Product",
      entityId: String(newProduct._id),
      details: `Created product "${newProduct.name}" (SKU: ${newProduct.sku || "N/A"})`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath(`/products/${slug}`);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
