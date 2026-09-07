import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  getStoredProductByIdOrSlug,
  updateStoredProduct,
  deleteStoredProduct,
} from "@/lib/store";

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
      product = getStoredProductByIdOrSlug(id);
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

    // Update in unified store
    const updatedInStore = updateStoredProduct(id, body);

    // Also attempt DB update
    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          await Product.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: false,
          });
        } else {
          await Product.findOneAndUpdate({ $or: [{ slug: id }, { sku: id }] }, body, {
            new: true,
            runValidators: false,
          });
        }
      }
    } catch (dbErr) {
      console.warn("Product update DB warning:", dbErr);
    }

    const finalProduct = updatedInStore || { ...body, _id: id };

    await logActivity({
      action: "PRODUCT_UPDATE",
      entity: "Product",
      entityId: String(finalProduct._id || id),
      details: `Updated product "${finalProduct.name || body.name || id}"`,
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
      if (finalProduct?.slug) revalidatePath(`/products/${finalProduct.slug}`);
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, product: finalProduct });
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

    // Delete from unified store
    deleteStoredProduct(id);

    // Also attempt DB deletion
    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          await Product.findByIdAndDelete(id);
        } else {
          await Product.findOneAndDelete({ $or: [{ slug: id }, { sku: id }] });
        }
      }
    } catch (dbErr) {
      console.warn("Product delete DB warning:", dbErr);
    }

    await logActivity({
      action: "PRODUCT_DELETE",
      entity: "Product",
      entityId: id,
      details: `Deleted product ${id}`,
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

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
