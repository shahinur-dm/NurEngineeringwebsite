import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  logActivity,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json(
        {
          error:
            "Database is unreachable. Please verify MONGODB_URI connection in your environment settings.",
        },
        { status: 503 }
      );
    }

    // Auto-seed default super admin if database has no users yet
    const count = await User.countDocuments();
    if (count === 0) {
      const defaultHash = await hashPassword("admin123456");
      await User.create({
        name: "Super Administrator",
        email: "admin@nurengineering.com",
        passwordHash: defaultHash,
        role: "super_admin",
        active: true,
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (!user || !user.active) {
      return NextResponse.json(
        { error: "Invalid email or account is inactive" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    await logActivity({
      action: "USER_LOGIN",
      entity: "User",
      entityId: String(user._id),
      details: `User ${user.email} logged in to admin panel`,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    console.error("Login error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error during login";
    return NextResponse.json(
      { error: `Login failed: ${message}` },
      { status: 500 }
    );
  }
}
