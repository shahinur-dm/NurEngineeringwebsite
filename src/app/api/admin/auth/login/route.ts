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

    const cleanEmail = String(email).toLowerCase().trim();

    try {
      const db = await connectDB();
      if (db) {
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
          email: cleanEmail,
        });

        if (user) {
          if (!user.active) {
            return NextResponse.json(
              { error: "Account is inactive. Contact system administrator." },
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
        }
      }
    } catch (dbErr) {
      console.warn("Database lookup warning during login:", dbErr);
    }

    // Default Super Admin authentication fallback
    if (
      cleanEmail === "admin@nurengineering.com" &&
      password === "admin123456"
    ) {
      const token = signSessionToken({
        userId: "default_super_admin",
        email: "admin@nurengineering.com",
        role: "super_admin",
      });

      const response = NextResponse.json({
        success: true,
        user: {
          _id: "default_super_admin",
          name: "Super Administrator",
          email: "admin@nurengineering.com",
          role: "super_admin",
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
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
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
