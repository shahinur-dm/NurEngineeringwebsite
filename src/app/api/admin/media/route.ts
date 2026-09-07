import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { connectDB } from "@/lib/db";
import { MediaItem } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { getStoredMedia, saveStoredMedia, StoredMedia } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;

  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = {};
      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { filename: { $regex: q, $options: "i" } },
        ];
      }

      const dbItems = await MediaItem.find(filter).sort({ createdAt: -1 }).lean();
      if (dbItems.length > 0) {
        return NextResponse.json({ items: dbItems });
      }
    }
  } catch (err) {
    console.warn("Get media DB warning, using store:", err);
  }

  const stored = getStoredMedia(q);
  return NextResponse.json({ items: stored });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot upload" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || (file ? file.name : "Uploaded Asset");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const mimeType = file.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files (JPEG, PNG, WebP, SVG, GIF) are allowed" }, { status: 400 });
    }

    // Size limit: 4MB (Vercel Serverless Function Limit is 4.5MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds serverless upload limit of 4MB. Please use an optimized image." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const ext = path.extname(file.name) || ".jpg";
    const cleanName = path
      .basename(file.name, ext)
      .replace(/[^\w-]/g, "")
      .toLowerCase();
    const filename = `${cleanName || "asset"}-${Date.now()}${ext}`;

    // Optionally attempt local filesystem write (for local dev)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
    } catch {
      // Ephemeral or read-only filesystem (Vercel serverless) — dataUrl will be used as permanent URL
    }

    const mediaItem: StoredMedia = {
      _id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      filename,
      url: dataUrl,
      data: dataUrl,
      mimeType,
      size: file.size,
      folder: "general",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredMedia(mediaItem);

    try {
      const db = await connectDB();
      if (db) {
        await MediaItem.create({
          title,
          filename,
          url: dataUrl,
          data: dataUrl,
          mimeType,
          size: file.size,
          folder: "general",
        });
      }
    } catch (dbErr) {
      console.warn("DB media save warning:", dbErr);
    }

    await logActivity({
      action: "MEDIA_UPLOAD",
      entity: "MediaItem",
      entityId: mediaItem._id,
      details: `Uploaded media file "${filename}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        _id: mediaItem._id,
        title: mediaItem.title,
        filename: mediaItem.filename,
        url: mediaItem.url,
        mimeType: mediaItem.mimeType,
        size: mediaItem.size,
        createdAt: mediaItem.createdAt,
      },
    });
  } catch (err) {
    console.error("Media upload error:", err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
