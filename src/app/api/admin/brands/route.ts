import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Brand } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  getStoredBrands,
  saveStoredBrand,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const brands = await Brand.find().sort({ order: 1, name: 1 }).lean();
      if (brands.length > 0) {
        return NextResponse.json({ brands });
      }
    }
  } catch (err) {
    console.warn("Get brands DB error, using store:", err);
  }

  const stored = getStoredBrands();
  return NextResponse.json({ brands: stored });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    // Save to store
    const brand = saveStoredBrand({
      name: body.name,
      slug: body.slug,
      logo: body.logo || "",
      description: body.description || "",
      order: body.order || 0,
      active: body.active !== undefined ? body.active : true,
    });

    // Also attempt DB write
    try {
      const db = await connectDB();
      if (db) {
        await Brand.create({
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
          description: brand.description,
          order: brand.order,
          active: brand.active,
        });
      }
    } catch (dbErr) {
      console.warn("DB brand save warning:", dbErr);
    }

    await logActivity({
      action: "BRAND_CREATE",
      entity: "Brand",
      entityId: String(brand._id),
      details: `Created brand "${brand.name}"`,
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

    return NextResponse.json({ success: true, brand });
  } catch (err) {
    console.error("Create brand error:", err);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
