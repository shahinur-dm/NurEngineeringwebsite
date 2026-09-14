import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { DownloadFile } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind");
  const db = await connectDB();
  if (!db) return NextResponse.json({ items: [] });

  const filter: Record<string, unknown> = {};
  if (kind === "catalogue" || kind === "manual") filter.kind = kind;

  const items = await DownloadFile.find(filter)
    .select("kind title filename mimeType size order createdAt")
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    items: items.map((doc) => ({
      _id: String(doc._id),
      kind: doc.kind,
      title: doc.title,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      order: doc.order,
      createdAt: doc.createdAt,
      downloadUrl: `/api/downloads/${String(doc._id)}/file`,
    })),
  });
}
