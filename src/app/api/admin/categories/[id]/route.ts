import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Category, Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  updateStoredCategory,
  deleteStoredCategory,
  getStoredCategoryByIdOrSlug,
} from "@/lib/store";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    // Update in store
    const updatedInStore = updateStoredCategory(id, body);

    // Also attempt DB update
    try {
      const db = await connectDB();
      if (db) {
        await Category.findByIdAndUpdate(id, body, { new: true });
      }
    } catch (dbErr) {
      console.warn("DB category update warning:", dbErr);
    }

    const updated = updatedInStore || { ...body, _id: id };

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

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore
    }

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

    const existing = getStoredCategoryByIdOrSlug(id);
    const catName = existing?.name || id;

    // Delete from store
    deleteStoredCategory(id);

    // Also attempt DB deletion
    try {
      const db = await connectDB();
      if (db) {
        await Category.findByIdAndDelete(id);
      }
    } catch (dbErr) {
      console.warn("DB category delete warning:", dbErr);
    }

    await logActivity({
      action: "CATEGORY_DELETE",
      entity: "Category",
      entityId: id,
      details: `Deleted category "${catName}"`,
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

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
