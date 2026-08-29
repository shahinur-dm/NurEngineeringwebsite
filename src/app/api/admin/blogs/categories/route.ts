import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BlogCategory } from "@/lib/models";
import { getCurrentAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const categories = await BlogCategory.find().sort({ order: 1, name: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("Get blog categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectDB();
    let slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const category = await BlogCategory.create({
      name: body.name,
      slug,
      description: body.description || "",
      order: body.order || 0,
      active: body.active !== undefined ? body.active : true,
    });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("Create blog category error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
