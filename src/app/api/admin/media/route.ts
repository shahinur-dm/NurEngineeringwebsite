import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { connectDB } from "@/lib/db";
import { MediaItem } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;

  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { filename: { $regex: q, $options: "i" } },
      ];
    }

    const items = await MediaItem.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items: items || [] });
  } catch (err: unknown) {
    console.error("Get media error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch media" },
      { status: 500 }
    );
  }
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

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const createdItem = await MediaItem.create({
      title,
      filename,
      url: dataUrl,
      data: dataUrl,
      mimeType,
      size: file.size,
      folder: "general",
    });

    await logActivity({
      action: "MEDIA_UPLOAD",
      entity: "MediaItem",
      entityId: String(createdItem._id),
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
        _id: String(createdItem._id),
        title: createdItem.title,
        filename: createdItem.filename,
        url: createdItem.url,
        mimeType: createdItem.mimeType,
        size: createdItem.size,
        createdAt: createdItem.createdAt,
      },
    });
  } catch (err: unknown) {
    console.error("Media upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}

