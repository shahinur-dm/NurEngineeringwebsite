"use client";

import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  productCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setOrder(categories.length + 1);
    setError("");
    setModalOpen(true);
  }

  function handleOpenEdit(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setOrder(cat.order || 0);
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug.trim() || undefined, description, order: Number(order) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");

      setModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete category");
        return;
      }
      loadCategories();
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            Category Management
          </h2>
          <p className="text-xs text-steel">
            Organize machine parts and electrical equipment groups.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn-orange px-4 py-2 text-xs font-bold uppercase"
        >
          + Add New Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="border-b border-line bg-paper/50 font-display text-[11px] font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="py-3 px-4 w-16">Order</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mist">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mist">
                    No categories found. Click &quot;+ Add New Category&quot; above.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-paper/30 transition">
                    <td className="py-3 px-4 font-bold text-orange">
                      {cat.order}
                    </td>
                    <td className="py-3 px-4 font-bold uppercase text-navy">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-steel">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4 text-mist max-w-xs truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-paper px-2 py-0.5 font-bold text-navy">
                        {cat.productCount ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="rounded border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-navy hover:border-orange transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="rounded border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-line bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-mist hover:text-navy font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded bg-red-50 p-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. PLC, Motors, Sensors"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Slug (optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated if blank"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Display Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this category..."
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded border border-line px-4 py-2 text-xs font-bold text-steel hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-orange px-5 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
