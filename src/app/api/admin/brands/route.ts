import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Brand } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const brands = await Brand.find().sort({ order: 1, name: 1 }).lean();
    return NextResponse.json({ brands });
  } catch (err) {
    console.error("Get brands error:", err);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    await connectDB();
    const slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const brand = await Brand.create({
      name: body.name,
      slug,
      logo: body.logo || "",
      description: body.description || "",
      order: body.order || 0,
      active: body.active !== undefined ? body.active : true,
    });

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

    return NextResponse.json({ success: true, brand });
  } catch (err) {
    console.error("Create brand error:", err);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
