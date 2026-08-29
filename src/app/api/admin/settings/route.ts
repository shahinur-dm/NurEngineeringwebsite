import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SiteSettings, CompanyProfile } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { fallbackSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await connectDB();
    if (db) {
      const [settings, profile] = await Promise.all([
        SiteSettings.findOne().lean(),
        CompanyProfile.findOne().lean(),
      ]);

      return NextResponse.json({ settings: settings || fallbackSettings, profile });
    }
  } catch (err) {
    console.warn("Get settings DB error, using fallback settings:", err);
  }

  return NextResponse.json({ settings: fallbackSettings, profile: null });
}

export async function PUT(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  try {
    const { settings, profile } = await req.json();
    await connectDB();

    let updatedSettings = null;
    let updatedProfile = null;

    if (settings) {
      updatedSettings = await SiteSettings.findOneAndUpdate({}, settings, {
        new: true,
        upsert: true,
      });
    }

    if (profile) {
      updatedProfile = await CompanyProfile.findOneAndUpdate({}, profile, {
        new: true,
        upsert: true,
      });
    }

    await logActivity({
      action: "SETTINGS_UPDATE",
      entity: "SiteSettings",
      details: `Updated website settings, branding and contact information`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("Update settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
