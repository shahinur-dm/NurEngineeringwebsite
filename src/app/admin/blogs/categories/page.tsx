"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
}

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blogs/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/blogs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug.trim() || undefined, description }),
      });
      if (res.ok) {
        setName("");
        setSlug("");
        setDescription("");
        loadCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            Blog Categories
          </h2>
          <p className="text-xs text-steel">
            Manage categories for your technical blog posts and articles.
          </p>
        </div>
        <Link
          href="/admin/blogs"
          className="rounded border border-line bg-white px-3.5 sm:px-4 py-2 text-xs font-bold text-navy hover:bg-paper transition w-full sm:w-auto text-center"
        >
          ← Back to All Posts
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_2fr]">
        {/* Form */}
        <div className="rounded-lg border border-line bg-white p-5 shadow-xs">
          <h3 className="font-display text-sm font-bold uppercase text-navy border-b border-line pb-2">
            Add New Category
          </h3>
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-navy">Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Automation Tutorials, Maintenance Tips"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Slug (optional)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated if empty"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-orange w-full py-2 text-xs font-bold uppercase disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
          <div className="border-b border-line px-5 py-3.5 bg-paper/50 font-display text-xs font-bold uppercase text-navy">
            Existing Blog Categories
          </div>
          <div className="divide-y divide-line/60">
            {loading ? (
              <p className="p-8 text-center text-xs text-mist">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="p-8 text-center text-xs text-mist">No categories created yet.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-navy uppercase">{cat.name}</p>
                    <p className="text-[11px] text-mist">{cat.slug}</p>
                    {cat.description && <p className="text-xs text-steel mt-1">{cat.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
