import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Brand } from "@/lib/models";
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

    const updated = await Brand.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

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
    await connectDB();

    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    await logActivity({
      action: "BRAND_DELETE",
      entity: "Brand",
      entityId: id,
      details: `Deleted brand "${brand.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (err) {
    console.error("Delete brand error:", err);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
