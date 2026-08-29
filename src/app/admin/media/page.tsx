"use client";

import { useEffect, useState } from "react";
import { Img } from "@/components/Img";

interface MediaItem {
  _id: string;
  title: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [search]);

  async function loadMedia() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) => [data.item, ...prev]);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        if (selectedItem?._id === id) setSelectedItem(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            Media Library
          </h2>
          <p className="text-xs text-steel">
            Upload, preview and manage all product pictures, logos and website assets.
          </p>
        </div>

        <label className="btn-orange cursor-pointer px-4 py-2 text-xs font-bold uppercase shrink-0 shadow-sm">
          <span>{uploading ? "Uploading..." : "+ Upload New Asset"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-white p-4 shadow-xs">
        <input
          type="search"
          placeholder="Search by file name or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
        />
        <p className="text-xs font-semibold text-steel">
          Total Assets: <span className="font-bold text-navy">{items.length}</span>
        </p>
      </div>

      {/* Media Grid */}
      <div className="rounded-lg border border-line bg-white p-3.5 sm:p-5 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-mist">Loading media library...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-3xl">🖼️</span>
            <p className="mt-2 text-sm font-bold text-navy">No media files uploaded yet</p>
            <p className="text-xs text-mist mt-1">Upload your first product photo or banner above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 sm:gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className={`group relative cursor-pointer overflow-hidden rounded border transition ${
                  selectedItem?._id === item._id
                    ? "border-orange ring-2 ring-orange/30 shadow-md"
                    : "border-line bg-paper/30 hover:border-navy/40"
                }`}
              >
                <div className="relative aspect-square w-full">
                  <Img
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="180px"
                  />
                </div>
                <div className="p-2 bg-white">
                  <p className="truncate text-[11px] font-bold text-navy">{item.title}</p>
                  <p className="text-[10px] text-mist">
                    {(item.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Image Detail Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-line bg-white p-4 sm:p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                Asset Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-mist hover:text-navy font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded border border-line bg-paper/40">
                <Img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  fill
                  className="object-contain p-2"
                  sizes="300px"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-bold uppercase text-mist">Title</p>
                  <p className="font-semibold text-navy mt-0.5">{selectedItem.title}</p>
                </div>

                <div>
                  <p className="font-bold uppercase text-mist">File Name</p>
                  <p className="font-mono text-steel mt-0.5 break-all">{selectedItem.filename}</p>
                </div>

                <div>
                  <p className="font-bold uppercase text-mist">File Size</p>
                  <p className="text-steel mt-0.5">{(selectedItem.size / 1024).toFixed(2)} KB</p>
                </div>

                <div>
                  <p className="font-bold uppercase text-mist">File URL</p>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="flex-1 rounded border border-line bg-paper/50 px-2.5 py-1.5 font-mono text-[10px] text-navy outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyUrl(selectedItem.url)}
                      className="btn-navy px-3 py-1.5 text-xs font-bold shrink-0"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-line">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedItem._id, selectedItem.filename)}
                    className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition w-full"
                  >
                    🗑️ Delete Asset Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
