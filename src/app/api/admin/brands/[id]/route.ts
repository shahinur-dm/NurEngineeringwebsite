import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Brand } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  updateStoredBrand,
  deleteStoredBrand,
  getStoredBrandByIdOrSlug,
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
    const updatedInStore = updateStoredBrand(id, body);

    // Also attempt DB update
    try {
      const db = await connectDB();
      if (db) {
        await Brand.findByIdAndUpdate(id, body, { new: true });
      }
    } catch (dbErr) {
      console.warn("DB brand update warning:", dbErr);
    }

    const updated = updatedInStore || { ...body, _id: id };

    await logActivity({
      action: "BRAND_UPDATE",
      entity: "Brand",
      entityId: String(updated._id),
      details: `Updated brand "${updated.name}"`,
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

    return NextResponse.json({ success: true, brand: updated });
  } catch (err) {
    console.error("Update brand error:", err);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
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

    const existing = getStoredBrandByIdOrSlug(id);
    const brandName = existing?.name || id;

    // Delete from store
    deleteStoredBrand(id);

    // Also attempt DB deletion
    try {
      const db = await connectDB();
      if (db) {
        await Brand.findByIdAndDelete(id);
      }
    } catch (dbErr) {
      console.warn("DB brand delete warning:", dbErr);
    }

    await logActivity({
      action: "BRAND_DELETE",
      entity: "Brand",
      entityId: id,
      details: `Deleted brand "${brandName}"`,
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

    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (err) {
    console.error("Delete brand error:", err);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
