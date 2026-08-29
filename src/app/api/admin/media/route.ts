import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { connectDB } from "@/lib/db";
import { MediaItem } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

// In-memory media cache for serverless fallback
declare global {
  var inMemoryMediaCache: Record<string, unknown>[] | undefined;
}

const memoryMedia: Record<string, unknown>[] = global.inMemoryMediaCache ?? [];
global.inMemoryMediaCache = memoryMedia;

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q");

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
      
      // Combine with memory cache for any newly uploaded items
      const combined = [...dbItems];
      for (const mem of memoryMedia) {
        if (!combined.some((item) => String(item._id) === String(mem._id))) {
          const mTitle = typeof mem.title === "string" ? mem.title : "";
          const mFilename = typeof mem.filename === "string" ? mem.filename : "";
          if (!q || mTitle.toLowerCase().includes(q.toLowerCase()) || mFilename.toLowerCase().includes(q.toLowerCase())) {
            combined.unshift(mem as unknown as (typeof dbItems)[number]);
          }
        }
      }

      return NextResponse.json({ items: combined });
    }
  } catch (err) {
    console.warn("Get media DB warning, using cache:", err);
  }

  // Fallback to in-memory media cache
  let filtered = [...memoryMedia];
  if (q) {
    const lq = q.toLowerCase();
    filtered = filtered.filter((item) => {
      const mTitle = typeof item.title === "string" ? item.title : "";
      const mFilename = typeof item.filename === "string" ? item.filename : "";
      return mTitle.toLowerCase().includes(lq) || mFilename.toLowerCase().includes(lq);
    });
  }

  return NextResponse.json({ items: filtered });
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

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds maximum limit of 10MB" }, { status: 400 });
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

    let savedItem: Record<string, unknown> | null = null;

    try {
      const db = await connectDB();
      if (db) {
        const item = await MediaItem.create({
          title,
          filename,
          url: dataUrl,
          data: dataUrl,
          mimeType,
          size: file.size,
          folder: "general",
        });

        savedItem = item.toObject();

        await logActivity({
          action: "MEDIA_UPLOAD",
          entity: "MediaItem",
          entityId: String(item._id),
          details: `Uploaded media file "${filename}"`,
          user: {
            _id: String(admin._id),
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB media save warning:", dbErr);
    }

    if (!savedItem) {
      savedItem = {
        _id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title,
        filename,
        url: dataUrl,
        data: dataUrl,
        mimeType,
        size: file.size,
        folder: "general",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Keep in memory cache
    memoryMedia.unshift(savedItem);

    return NextResponse.json({
      success: true,
      item: {
        _id: String(savedItem._id),
        title: savedItem.title,
        filename: savedItem.filename,
        url: savedItem.url,
        mimeType: savedItem.mimeType,
        size: savedItem.size,
        createdAt: savedItem.createdAt,
      },
    });
  } catch (err) {
    console.error("Media upload error:", err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
