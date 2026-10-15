import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { DownloadFile, DownloadUploadSession } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import {
  storeDirectGridFsChunk,
  finalizeDirectGridFsFile,
  deleteDownloadBuffer,
  isValidPdfBuffer,
} from "@/lib/download-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB maximum supported PDF file size
const MAX_CHUNK_BYTES = 4 * 1024 * 1024; // 4MB maximum per HTTP chunk (fits Vercel 4.5MB limit)

function serialize(doc: {
  _id: unknown;
  kind?: string;
  title?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: String(doc._id),
    kind: doc.kind,
    title: doc.title,
    filename: doc.filename,
    mimeType: doc.mimeType,
    size: doc.size,
    order: doc.order,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    downloadUrl: `/api/downloads/${String(doc._id)}/file`,
  };
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot upload" }, { status: 403 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  await connectDB();

  // ACTION: START UPLOAD SESSION
  if (action === "start") {
    try {
      const body = await req.json();
      const title = String(body.title || "").trim();
      const kind = String(body.kind || "").trim();
      const filename = String(body.filename || "").trim();
      const mimeType = String(body.mimeType || "application/pdf").trim();
      const totalSize = Number(body.totalSize || 0);
      const totalChunks = Number(body.totalChunks || 0);
      const order = Number(body.order || 0);

      if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
      }
      if (kind !== "catalogue" && kind !== "manual") {
        return NextResponse.json({ error: "Invalid download type" }, { status: 400 });
      }
      if (!filename.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json({ error: "Only PDF files (.pdf) are allowed" }, { status: 400 });
      }
      if (totalSize <= 0) {
        return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
      }
      if (totalSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File size (${(totalSize / (1024 * 1024)).toFixed(
              1
            )}MB) exceeds maximum allowed upload limit of 50MB. Please upload a smaller PDF.`,
          },
          { status: 400 }
        );
      }
      if (totalChunks <= 0 || totalChunks > 50) {
        return NextResponse.json({ error: "Invalid chunk count" }, { status: 400 });
      }

      const uploadId = new mongoose.Types.ObjectId().toString();
      const gridFsId = new mongoose.Types.ObjectId();

      await DownloadUploadSession.create({
        uploadId,
        gridFsId,
        filename,
        mimeType,
        totalSize,
        totalChunks,
        title,
        kind,
        order: Number.isFinite(order) ? order : 0,
        createdAt: new Date(),
      });

      return NextResponse.json({ uploadId });
    } catch (err) {
      console.error("Start chunk upload error:", err);
      return NextResponse.json({ error: "Failed to initialize upload session" }, { status: 500 });
    }
  }

  // ACTION: UPLOAD SINGLE CHUNK (Directly slices & inserts into download_files.chunks)
  if (action === "upload") {
    try {
      const uploadId = url.searchParams.get("uploadId");
      const chunkIndexRaw = url.searchParams.get("chunkIndex");
      if (!uploadId || chunkIndexRaw === null) {
        return NextResponse.json({ error: "Missing uploadId or chunkIndex" }, { status: 400 });
      }

      const chunkIndex = parseInt(chunkIndexRaw, 10);
      if (isNaN(chunkIndex) || chunkIndex < 0) {
        return NextResponse.json({ error: "Invalid chunkIndex" }, { status: 400 });
      }

      const session = await DownloadUploadSession.findOne({ uploadId });
      if (!session) {
        return NextResponse.json({ error: "Upload session expired or invalid" }, { status: 404 });
      }

      const formData = await req.formData();
      const file = formData.get("chunk") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No chunk file provided" }, { status: 400 });
      }

      if (file.size > MAX_CHUNK_BYTES) {
        return NextResponse.json({ error: "Chunk size exceeds maximum chunk limit" }, { status: 400 });
      }

      const chunkBuffer = Buffer.from(await file.arrayBuffer());

      // On first chunk, inspect magic bytes to ensure genuine PDF
      if (chunkIndex === 0) {
        if (!isValidPdfBuffer(chunkBuffer)) {
          await deleteDownloadBuffer(session.gridFsId);
          await DownloadUploadSession.deleteOne({ uploadId });
          return NextResponse.json(
            { error: "Invalid file content. The uploaded file is not a valid PDF document." },
            { status: 400 }
          );
        }
      }

      await storeDirectGridFsChunk({
        gridFsId: session.gridFsId,
        chunkIndex,
        buffer: chunkBuffer,
      });

      return NextResponse.json({ success: true, chunkIndex });
    } catch (err) {
      console.error("Upload chunk error:", err);
      return NextResponse.json({ error: "Failed to store chunk" }, { status: 500 });
    }
  }

  // ACTION: FINISH & INSERT FILE METADATA INTO GRIDFS
  if (action === "finish") {
    try {
      const uploadId = url.searchParams.get("uploadId");
      const editId = url.searchParams.get("editId");
      if (!uploadId) {
        return NextResponse.json({ error: "Missing uploadId" }, { status: 400 });
      }

      const session = await DownloadUploadSession.findOne({ uploadId });
      if (!session) {
        return NextResponse.json({ error: "Upload session not found or expired" }, { status: 404 });
      }

      const stored = await finalizeDirectGridFsFile({
        gridFsId: session.gridFsId,
        filename: session.filename,
        mimeType: session.mimeType || "application/pdf",
        totalSize: session.totalSize,
      });

      // Cleanup session document immediately
      await DownloadUploadSession.deleteOne({ uploadId });

      if (editId) {
        const item = await DownloadFile.findById(editId);
        if (!item) {
          await deleteDownloadBuffer(stored.id);
          return NextResponse.json({ error: "Existing download item not found" }, { status: 404 });
        }

        // Delete old GridFS file
        if (item.gridFsId) {
          await deleteDownloadBuffer(item.gridFsId);
        }

        item.title = session.title;
        item.filename = session.filename;
        item.mimeType = session.mimeType || "application/pdf";
        item.size = stored.size;
        item.gridFsId = stored.id;
        item.order = session.order;

        await item.save();

        await logActivity({
          action: "DOWNLOAD_UPDATE",
          entity: "DownloadFile",
          entityId: String(item._id),
          details: `Updated ${item.kind} "${item.title}" with new file (${(
            stored.size /
            (1024 * 1024)
          ).toFixed(2)} MB)`,
          user: {
            _id: String(admin._id),
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
        });

        return NextResponse.json({ success: true, item: serialize(item) });
      }

      // New download record
      const item = await DownloadFile.create({
        kind: session.kind,
        title: session.title,
        filename: session.filename,
        mimeType: session.mimeType || "application/pdf",
        size: stored.size,
        gridFsId: stored.id,
        order: session.order,
      });

      await logActivity({
        action: "DOWNLOAD_CREATE",
        entity: "DownloadFile",
        entityId: String(item._id),
        details: `Uploaded ${session.kind} "${session.title}" (${(
          stored.size /
          (1024 * 1024)
        ).toFixed(2)} MB)`,
        user: {
          _id: String(admin._id),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });

      return NextResponse.json({ success: true, item: serialize(item) });
    } catch (err) {
      console.error("Finish chunk upload error:", err);
      return NextResponse.json({ error: "Failed to assemble and save PDF" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const uploadId = url.searchParams.get("uploadId");
  if (!uploadId) return NextResponse.json({ error: "Missing uploadId" }, { status: 400 });

  await connectDB();
  const session = await DownloadUploadSession.findOne({ uploadId });
  if (session && session.gridFsId) {
    await deleteDownloadBuffer(session.gridFsId);
  }
  await DownloadUploadSession.deleteOne({ uploadId });

  return NextResponse.json({ success: true });
}
