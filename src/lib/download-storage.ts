import { Readable } from "stream";
import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

const BUCKET = "download_files";

export async function getBucket() {
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) return null;
  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
}

export function isValidPdfBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 5) return false;
  // Check for '%PDF-' signature in the first 1024 bytes per PDF standard
  const header = buffer.subarray(0, Math.min(buffer.length, 1024)).toString("ascii");
  return header.includes("%PDF-");
}

export async function storeDownloadBuffer(params: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<{ id: ObjectId; size: number } | null> {
  const bucket = await getBucket();
  if (!bucket) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(params.filename, {
      contentType: params.mimeType,
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({ id: uploadStream.id as ObjectId, size: params.buffer.length });
    });
    uploadStream.end(params.buffer);
  });
}

export const GRIDFS_CHUNK_SIZE = 255 * 1024; // 261,120 bytes
export const SUBCHUNKS_PER_CLIENT_CHUNK = 10;
export const CLIENT_CHUNK_SIZE = SUBCHUNKS_PER_CLIENT_CHUNK * GRIDFS_CHUNK_SIZE; // 2,611,200 bytes (~2.49 MB)

export async function storeDirectGridFsChunk(params: {
  gridFsId: ObjectId | string;
  chunkIndex: number;
  buffer: Buffer;
}): Promise<void> {
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) throw new Error("Database not connected");

  const files_id = typeof params.gridFsId === "string" ? new ObjectId(params.gridFsId) : params.gridFsId;
  const chunksCol = mongoose.connection.db.collection("download_files.chunks");

  const docs = [];
  let subIndex = 0;
  for (let offset = 0; offset < params.buffer.length; offset += GRIDFS_CHUNK_SIZE) {
    const end = Math.min(offset + GRIDFS_CHUNK_SIZE, params.buffer.length);
    const subSlice = params.buffer.subarray(offset, end);
    const n = params.chunkIndex * SUBCHUNKS_PER_CLIENT_CHUNK + subIndex;
    docs.push({
      files_id,
      n,
      data: subSlice,
    });
    subIndex++;
  }

  if (docs.length > 0) {
    await chunksCol.insertMany(docs, { ordered: true });
  }
}

export async function finalizeDirectGridFsFile(params: {
  gridFsId: ObjectId | string;
  filename: string;
  mimeType: string;
  totalSize: number;
}): Promise<{ id: ObjectId; size: number }> {
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) throw new Error("Database not connected");

  const files_id = typeof params.gridFsId === "string" ? new ObjectId(params.gridFsId) : params.gridFsId;
  const filesCol = mongoose.connection.db.collection("download_files.files");

  await filesCol.insertOne({
    _id: files_id,
    length: params.totalSize,
    chunkSize: GRIDFS_CHUNK_SIZE,
    uploadDate: new Date(),
    filename: params.filename,
    contentType: params.mimeType || "application/pdf",
  });

  return { id: files_id, size: params.totalSize };
}

export async function deleteDownloadBuffer(id: string | ObjectId | undefined) {
  if (!id) return;
  const conn = await connectDB();
  if (!conn || !mongoose.connection.db) return;
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  const filesCol = mongoose.connection.db.collection("download_files.files");
  const chunksCol = mongoose.connection.db.collection("download_files.chunks");
  await filesCol.deleteOne({ _id: objectId }).catch(() => {});
  await chunksCol.deleteMany({ files_id: objectId }).catch(() => {});
}

export async function getDownloadFileStream(id: string | ObjectId): Promise<{
  stream: ReadableStream<Uint8Array>;
  filename: string;
  mimeType: string;
  length: number;
} | null> {
  const bucket = await getBucket();
  if (!bucket) return null;
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files.length) return null;
  const file = files[0];
  const nodeStream = bucket.openDownloadStream(objectId);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  return {
    stream: webStream,
    filename: file.filename,
    mimeType: file.contentType || "application/pdf",
    length: file.length,
  };
}

export async function readDownloadBuffer(id: string | ObjectId): Promise<{
  buffer: Buffer;
  filename: string;
  mimeType: string;
} | null> {
  const bucket = await getBucket();
  if (!bucket) return null;
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files.length) return null;
  const file = files[0];
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const stream = bucket.openDownloadStream(objectId);
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve());
  });
  return {
    buffer: Buffer.concat(chunks),
    filename: file.filename,
    mimeType: file.contentType || "application/pdf",
  };
}

export function isAllowedDownloadFile(file: File) {
  const name = file.name.toLowerCase();
  const mime = (file.type || "").toLowerCase();
  const pdf =
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    name.endsWith(".pdf");
  return pdf;
}

