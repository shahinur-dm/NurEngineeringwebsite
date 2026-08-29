import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const categories = await Category.find({ type: "product" })
      .sort({ order: 1, name: 1 })
      .lean();

    // Attach product counts
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return { ...cat, productCount: count };
      })
    );

    return NextResponse.json({ categories: withCounts });
  } catch (err) {
    console.error("Get categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    await connectDB();
    const slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const category = await Category.create({
      name: body.name,
      slug,
      description: body.description || "",
      order: body.order || 0,
      type: "product",
    });

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
      await connectDB();
      await Promise.all(
        items.map((item) =>
          Category.findByIdAndUpdate(item._id, { order: item.order })
        )
      );
      return NextResponse.json({ success: true, message: "Reordered categories" });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    console.error("Reorder categories error:", err);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
