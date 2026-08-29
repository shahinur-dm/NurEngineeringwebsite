import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id)
      .populate("category")
      .populate("relatedServices")
      .lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    console.error("Get product error:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await logActivity({
      action: "PRODUCT_UPDATE",
      entity: "Product",
      entityId: String(updated._id),
      details: `Updated product "${updated.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await logActivity({
      action: "PRODUCT_DELETE",
      entity: "Product",
      entityId: id,
      details: `Deleted product "${product.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
