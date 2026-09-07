import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  getStoredCategories,
  saveStoredCategory,
  updateStoredCategory,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const categories = await Category.find({ type: "product" })
        .sort({ order: 1, name: 1 })
        .lean();

      if (categories.length > 0) {
        // Attach product counts
        const withCounts = await Promise.all(
          categories.map(async (cat) => {
            const count = await Product.countDocuments({ category: cat._id });
            return { ...cat, productCount: count };
          })
        );

        return NextResponse.json({ categories: withCounts });
      }
    }
  } catch (err) {
    console.warn("Get categories DB error, using store:", err);
  }

  // Fallback to store
  const storedCats = getStoredCategories("product");
  return NextResponse.json({ categories: storedCats });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Save to store
    const category = saveStoredCategory({
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      order: body.order || 0,
      type: "product",
    });

    // Also attempt DB write
    try {
      const db = await connectDB();
      if (db) {
        await Category.create({
          name: category.name,
          slug: category.slug,
          description: category.description,
          order: category.order,
          type: "product",
        });
      }
    } catch (dbErr) {
      console.warn("DB category save warning:", dbErr);
    }

    await logActivity({
      action: "CATEGORY_CREATE",
      entity: "Category",
      entityId: String(category._id),
      details: `Created category "${category.name}"`,
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
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { items } = await req.json(); // Array of { _id, order } for bulk reordering
    if (Array.isArray(items)) {
      items.forEach((item) => {
        updateStoredCategory(item._id, { order: item.order });
      });

      try {
        const db = await connectDB();
        if (db) {
          await Promise.all(
            items.map((item) =>
              Category.findByIdAndUpdate(item._id, { order: item.order })
            )
          );
        }
      } catch (dbErr) {
        console.warn("DB category reorder warning:", dbErr);
      }

      try {
        revalidatePath("/", "layout");
        revalidatePath("/");
        revalidatePath("/products");
        revalidatePath("/api/catalog-tree");
        revalidatePath("/api/products");
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, message: "Reordered categories" });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    console.error("Reorder categories error:", err);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
