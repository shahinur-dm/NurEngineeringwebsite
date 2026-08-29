import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const updated = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await logActivity({
      action: "CATEGORY_UPDATE",
      entity: "Category",
      entityId: String(updated._id),
      details: `Updated category "${updated.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err) {
    console.error("Update category error:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await connectDB();

    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: Category has ${productCount} assigned products` },
        { status: 400 }
      );
    }

    const cat = await Category.findByIdAndDelete(id);
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await logActivity({
      action: "CATEGORY_DELETE",
      entity: "Category",
      entityId: id,
      details: `Deleted category "${cat.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
