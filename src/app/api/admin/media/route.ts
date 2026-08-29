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
  const q = url.searchParams.get("q");

  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { filename: { $regex: q, $options: "i" } },
      ];
    }

    const items = await MediaItem.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items });
  } catch (err) {
    console.error("Get media error:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const cleanName = path
      .basename(file.name, ext)
      .replace(/[^\w-]/g, "")
      .toLowerCase();
    const filename = `${cleanName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    await connectDB();
    const item = await MediaItem.create({
      title,
      filename,
      url: publicUrl,
      mimeType: file.type || "image/jpeg",
      size: file.size,
      folder: "general",
    });

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

    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("Media upload error:", err);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
