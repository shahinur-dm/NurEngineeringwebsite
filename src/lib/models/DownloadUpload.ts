import { Schema, models, model } from "mongoose";

export interface IDownloadUploadSession {
  uploadId: string;
  gridFsId: Schema.Types.ObjectId;
  filename: string;
  mimeType: string;
  totalSize: number;
  totalChunks: number;
  title: string;
  kind: "catalogue" | "manual";
  order: number;
  createdAt: Date;
}

export interface IDownloadUploadChunk {
  uploadId: string;
  chunkIndex: number;
  size: number;
  data: Buffer;
  createdAt: Date;
}

const DownloadUploadSessionSchema = new Schema<IDownloadUploadSession>(
  {
    uploadId: { type: String, required: true, unique: true, index: true },
    gridFsId: { type: Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, default: "application/pdf" },
    totalSize: { type: Number, required: true },
    totalChunks: { type: Number, required: true },
    title: { type: String, required: true },
    kind: { type: String, enum: ["catalogue", "manual"], required: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 7200 }, // 2 hours TTL
  },
  { timestamps: false }
);

const DownloadUploadChunkSchema = new Schema<IDownloadUploadChunk>(
  {
    uploadId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now, expires: 7200 }, // 2 hours TTL
  },
  { timestamps: false }
);

DownloadUploadChunkSchema.index({ uploadId: 1, chunkIndex: 1 }, { unique: true });

export const DownloadUploadSession =
  models.DownloadUploadSession ||
  model<IDownloadUploadSession>("DownloadUploadSession", DownloadUploadSessionSchema);

export const DownloadUploadChunk =
  models.DownloadUploadChunk ||
  model<IDownloadUploadChunk>("DownloadUploadChunk", DownloadUploadChunkSchema);
