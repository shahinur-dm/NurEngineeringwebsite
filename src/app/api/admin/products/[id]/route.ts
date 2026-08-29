import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { mockProducts } from "@/lib/mock-data";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    let product = null;

    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          product = await Product.findById(id)
            .populate("category")
            .populate("relatedServices")
            .lean();
        }
        if (!product) {
          product = await Product.findOne({ $or: [{ slug: id }, { sku: id }] })
            .populate("category")
            .populate("relatedServices")
            .lean();
        }
      }
    } catch (dbErr) {
      console.warn("Product find DB warning:", dbErr);
    }

    if (!product) {
      product = mockProducts.find((p) => String(p._id) === id || p.slug === id);
    }

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
    let updated = null;

    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          updated = await Product.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
          });
        }
        if (!updated) {
          updated = await Product.findOneAndUpdate({ $or: [{ slug: id }, { sku: id }] }, body, {
            new: true,
            runValidators: true,
          });
        }
      }
    } catch (dbErr) {
      console.warn("Product update DB warning:", dbErr);
    }

    if (!updated) {
      // In-memory update
      updated = { ...body, _id: id };
    }

    await logActivity({
      action: "PRODUCT_UPDATE",
      entity: "Product",
      entityId: String(updated._id || id),
      details: `Updated product "${updated.name || body.name || id}"`,
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
      if (updated.slug) revalidatePath(`/products/${updated.slug}`);
    } catch {
      // ignore
    }

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
    let product = null;

    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          product = await Product.findByIdAndDelete(id);
        }
        if (!product) {
          product = await Product.findOneAndDelete({ $or: [{ slug: id }, { sku: id }] });
        }
      }
    } catch (dbErr) {
      console.warn("Product delete DB warning:", dbErr);
    }

    await logActivity({
      action: "PRODUCT_DELETE",
      entity: "Product",
      entityId: id,
      details: `Deleted product ${product?.name || id}`,
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
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
