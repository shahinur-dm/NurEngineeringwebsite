import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, type IUser } from "@/lib/models";
import {
  getCurrentAdminUser,
  hashPassword,
  logActivity,
} from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.role) updateData.role = body.role;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.password) {
      updateData.passwordHash = await hashPassword(body.password);
    }

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-passwordHash")
      .lean<IUser | null>();

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await logActivity({
      action: "USER_UPDATE",
      entity: "User",
      entityId: id,
      details: `Updated user "${updated.name}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  try {
    const { id } = await params;
    if (String(admin._id) === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await logActivity({
      action: "USER_DELETE",
      entity: "User",
      entityId: id,
      details: `Deleted user "${user.name}" (${user.email})`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
