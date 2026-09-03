import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SubCategory, Category } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { mockSubCategories, mockCategories } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    try {
      const db = await connectDB();
      if (db) {
        const filter = categoryId ? { category: categoryId } : {};
        const subcategories = await SubCategory.find(filter)
          .populate("category", "name slug")
          .sort({ order: 1, createdAt: -1 })
          .lean();
        return NextResponse.json({ subcategories });
      }
    } catch (dbErr) {
      console.warn("DB error fetching subcategories, using mock:", dbErr);
    }

    const catMap = new Map(mockCategories.map((c) => [String(c._id), c]));
    let list = mockSubCategories.map((s) => ({
      ...s,
      category: catMap.get(String(s.category)) || { name: "General", slug: "general" },
    }));

    if (categoryId) {
      list = list.filter(
        (s) =>
          String(typeof s.category === "object" ? (s.category as unknown as { _id: string })._id : s.category) === categoryId ||
          (typeof s.category === "object" && (s.category as unknown as { slug: string }).slug === categoryId)
      );
    }

    return NextResponse.json({ subcategories: list });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load subcategories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, slug, category, description, order } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Name and parent Category are required" }, { status: 400 });
    }

    await connectDB();

    const genSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const exists = await SubCategory.findOne({ slug: genSlug });
    if (exists) {
      return NextResponse.json({ error: "Subcategory slug already exists" }, { status: 400 });
    }

    const sub = await SubCategory.create({
      name,
      slug: genSlug,
      category,
      description,
      order: Number(order) || 0,
      published: true,
    });

    await logActivity({
      action: "CATEGORY_CREATE",
      entity: "SubCategory",
      entityId: String(sub._id),
      details: `Created sub-category "${sub.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, subcategory: sub });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
