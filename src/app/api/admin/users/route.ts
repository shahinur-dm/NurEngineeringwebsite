import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import {
  getCurrentAdminUser,
  hashPassword,
  logActivity,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: role || "admin",
      active: true,
    });

    await logActivity({
      action: "USER_CREATE",
      entity: "User",
      entityId: String(user._id),
      details: `Created user "${user.name}" (${user.email}) with role ${user.role}`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
