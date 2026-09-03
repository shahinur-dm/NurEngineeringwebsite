import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SubCategory } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    await connectDB();
    const body = await req.json();

    const sub = await SubCategory.findById(id);
    if (!sub) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    if (body.name) sub.name = body.name;
    if (body.slug) sub.slug = body.slug.trim().toLowerCase();
    if (body.category) sub.category = body.category;
    if (body.description !== undefined) sub.description = body.description;
    if (body.order !== undefined) sub.order = Number(body.order);
    if (body.published !== undefined) sub.published = Boolean(body.published);

    await sub.save();

    await logActivity({
      action: "CATEGORY_UPDATE",
      entity: "SubCategory",
      entityId: id,
      details: `Updated sub-category "${sub.name}"`,
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
      { error: err instanceof Error ? err.message : "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await connectDB();
    const sub = await SubCategory.findByIdAndDelete(id);
    if (!sub) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    await logActivity({
      action: "CATEGORY_DELETE",
      entity: "SubCategory",
      entityId: id,
      details: `Deleted sub-category "${sub.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Subcategory deleted" });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
