import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Brand } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const brands = await Brand.find().sort({ order: 1, name: 1 }).lean();
      return NextResponse.json({ brands });
    }
  } catch (err) {
    console.warn("Get brands DB error, using fallback brands:", err);
  }

  return NextResponse.json({
    brands: [
      { _id: "b1", name: "Siemens", slug: "siemens", description: "Industrial Automation & Drives", active: true, order: 1 },
      { _id: "b2", name: "Delta Electronics", slug: "delta", description: "VFD, PLC & Motion Control", active: true, order: 2 },
      { _id: "b3", name: "Mitsubishi Electric", slug: "mitsubishi", description: "PLC, HMI & Inverters", active: true, order: 3 },
      { _id: "b4", name: "Omron", slug: "omron", description: "Sensors, Relays & Timers", active: true, order: 4 },
      { _id: "b5", name: "Schneider Electric", slug: "schneider", description: "Switchgear, Contactors & Breakers", active: true, order: 5 },
      { _id: "b6", name: "ABB", slug: "abb", description: "Drives, Motors & Robotics", active: true, order: 6 },
    ],
  });
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
