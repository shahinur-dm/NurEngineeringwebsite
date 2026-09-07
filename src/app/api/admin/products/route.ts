import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  getStoredProducts,
  saveStoredProduct,
  StoredProduct,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const stock = url.searchParams.get("stock") || undefined;
  const published = url.searchParams.get("published") || undefined;
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

      if (items.length > 0) {
        return NextResponse.json({
          items,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit) || 1,
          },
        });
      }
    }
  } catch (err) {
    console.warn("Fetch products DB error, using store:", err);
  }

  // Fallback to store
  const stored = getStoredProducts({
    q,
    categorySlug: category,
    stock,
    published,
    page,
    limit,
  });

  return NextResponse.json({
    items: stored.items,
    pagination: {
      page,
      limit,
      total: stored.total,
      pages: Math.ceil(stored.total / limit) || 1,
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

    let createdProduct: StoredProduct | null = null;

    // Save to unified persistent store
    createdProduct = saveStoredProduct({
      ...body,
      price: Number(body.price) || 0,
      inStock: body.inStock !== false,
      published: body.published !== false,
      featured: Boolean(body.featured),
    });

    // Also attempt DB write
    try {
      const db = await connectDB();
      if (db) {
        let slug = createdProduct.slug;
        const existing = await Product.findOne({ slug });
        if (existing) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        await Product.create({
          ...body,
          slug,
          gallery: body.gallery || [],
          videoUrl: body.videoUrl || undefined,
          specs: body.specs || [],
          specTable: body.specTable || [],
          atAGlance: body.atAGlance || [],
          includedItems: body.includedItems || [],
          beforeYouOrder: body.beforeYouOrder || [],
          condition: body.condition || undefined,
          packing: body.packing || undefined,
          warranty: body.warranty || undefined,
          warrantyAndReturns: body.warrantyAndReturns || undefined,
          availabilityText: body.availabilityText || undefined,
          relatedProducts: body.relatedProducts || [],
          relatedServices: body.relatedServices || [],
        });
      }
    } catch (dbErr) {
      console.warn("DB product save warning:", dbErr);
    }

    await logActivity({
      action: "PRODUCT_CREATE",
      entity: "Product",
      entityId: String(createdProduct._id),
      details: `Created product "${createdProduct.name}" (SKU: ${createdProduct.sku || "N/A"})`,
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
      revalidatePath(`/products/${createdProduct.slug}`);
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
