import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SiteSettings, CompanyProfile } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { fallbackSettings } from "@/lib/data";
import { serialize } from "@/lib/serialize";
import { getStoredSettings, updateStoredSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let doc: Record<string, unknown> | null = null;
  let profile: Record<string, unknown> | null = null;

  try {
    const db = await connectDB();
    if (db) {
      const [settingsDoc, profileDoc] = await Promise.all([
        SiteSettings.findOne().lean(),
        CompanyProfile.findOne().lean(),
      ]);
      if (settingsDoc) doc = serialize(settingsDoc) as unknown as Record<string, unknown>;
      if (profileDoc) profile = serialize(profileDoc) as unknown as Record<string, unknown>;
    }
  } catch (err) {
    console.warn("Get settings DB warning:", err);
  }

  const stored = getStoredSettings();
  const mem = (global as unknown as { inMemorySettingsCache?: Record<string, unknown> }).inMemorySettingsCache || {};
  const merged = {
    ...fallbackSettings,
    ...stored,
    ...mem,
    ...(doc || {}),
    social: {
      ...fallbackSettings.social,
      ...((stored.social as Record<string, string>) || {}),
      ...((mem.social as Record<string, string>) || {}),
      ...((doc?.social as Record<string, string>) || {}),
    },
    footerQr: {
      ...fallbackSettings.footerQr,
      ...((stored.footerQr as Record<string, unknown>) || {}),
      ...((mem.footerQr as Record<string, unknown>) || {}),
      ...((doc?.footerQr as Record<string, unknown>) || {}),
    },
    seo: {
      ...fallbackSettings.seo,
      ...((stored.seo as Record<string, unknown>) || {}),
      ...((mem.seo as Record<string, unknown>) || {}),
      ...((doc?.seo as Record<string, unknown>) || {}),
    },
    analytics: {
      ...fallbackSettings.analytics,
      ...((stored.analytics as Record<string, string>) || {}),
      ...((mem.analytics as Record<string, string>) || {}),
      ...((doc?.analytics as Record<string, string>) || {}),
    },
  };

  return NextResponse.json({ settings: merged, profile });
}

export async function PUT(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
  }

  try {
    const { settings, profile } = await req.json();
    let updatedSettings: Record<string, unknown> | null = null;
    let updatedProfile: Record<string, unknown> | null = null;

    let existingDoc: Record<string, unknown> | null = null;
    try {
      const db = await connectDB();
      if (db) {
        const found = await SiteSettings.findOne().lean();
        if (found) existingDoc = serialize(found) as unknown as Record<string, unknown>;
      }
    } catch (dbReadErr) {
      console.warn("Settings read before update warning:", dbReadErr);
    }

    const stored = getStoredSettings();
    const mem = (global as unknown as { inMemorySettingsCache?: Record<string, unknown> }).inMemorySettingsCache || {};

    const mergedSettingsToPersist = {
      ...fallbackSettings,
      ...stored,
      ...(existingDoc || {}),
      ...mem,
      ...(settings || {}),
      social: {
        ...fallbackSettings.social,
        ...((stored.social as Record<string, string>) || {}),
        ...((existingDoc?.social as Record<string, string>) || {}),
        ...((mem.social as Record<string, string>) || {}),
        ...(settings?.social || {}),
      },
      footerQr: {
        ...fallbackSettings.footerQr,
        ...((stored.footerQr as Record<string, unknown>) || {}),
        ...((existingDoc?.footerQr as Record<string, unknown>) || {}),
        ...((mem.footerQr as Record<string, unknown>) || {}),
        ...(settings?.footerQr || {}),
      },
      seo: {
        ...fallbackSettings.seo,
        ...((stored.seo as Record<string, unknown>) || {}),
        ...((existingDoc?.seo as Record<string, unknown>) || {}),
        ...((mem.seo as Record<string, unknown>) || {}),
        ...(settings?.seo || {}),
      },
      analytics: {
        ...fallbackSettings.analytics,
        ...((stored.analytics as Record<string, string>) || {}),
        ...((existingDoc?.analytics as Record<string, string>) || {}),
        ...((mem.analytics as Record<string, string>) || {}),
        ...(settings?.analytics || {}),
      },
    };

    if (settings) {
      (global as unknown as { inMemorySettingsCache?: Record<string, unknown> }).inMemorySettingsCache = mergedSettingsToPersist;
      updateStoredSettings(mergedSettingsToPersist);
    }

    try {
      const db = await connectDB();
      if (db) {
        if (settings) {
          const existing = await SiteSettings.findOne();
          if (existing) {
            const resDoc = await SiteSettings.findByIdAndUpdate(
              existing._id,
              { $set: mergedSettingsToPersist },
              { new: true, runValidators: false }
            ).lean();
            if (resDoc) updatedSettings = serialize(resDoc) as unknown as Record<string, unknown>;
          } else {
            const created = await SiteSettings.create(mergedSettingsToPersist);
            if (created) {
              const obj = typeof created.toObject === "function" ? created.toObject() : created;
              updatedSettings = serialize(obj) as unknown as Record<string, unknown>;
            }
          }
        }

        if (profile) {
          const existingProf = await CompanyProfile.findOne();
          if (existingProf) {
            const resProf = await CompanyProfile.findByIdAndUpdate(
              existingProf._id,
              { $set: profile },
              { new: true, runValidators: false }
            ).lean();
            if (resProf) updatedProfile = serialize(resProf) as unknown as Record<string, unknown>;
          } else {
            const createdProf = await CompanyProfile.create(profile);
            if (createdProf) {
              const obj = typeof createdProf.toObject === "function" ? createdProf.toObject() : createdProf;
              updatedProfile = serialize(obj) as unknown as Record<string, unknown>;
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn("Database save warning in settings:", dbErr);
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

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
      revalidatePath("/products");
      revalidatePath("/services");
      revalidatePath("/use-cases");
      revalidatePath("/blog");
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings || mergedSettingsToPersist,
      profile: updatedProfile || profile,
    });
  } catch (err: unknown) {
    console.error("Update settings error:", err);
    const msg = err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
