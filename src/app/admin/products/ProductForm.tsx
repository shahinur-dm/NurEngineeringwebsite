"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Img } from "@/components/Img";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: {
    _id?: string;
    name: string;
    slug?: string;
    sku?: string;
    brand?: string;
    category: string | { _id: string };
    shortDescription: string;
    description: string;
    price?: number;
    currency: string;
    image: string;
    gallery: string[];
    specs: string[];
    inStock: boolean;
    featured: boolean;
    published: boolean;
    order: number;
  };
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [category, setCategory] = useState(
    typeof initialData?.category === "object"
      ? initialData.category._id
      : initialData?.category || ""
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [price, setPrice] = useState<string>(
    initialData?.price ? String(initialData.price) : ""
  );
  const [currency, setCurrency] = useState(initialData?.currency || "BDT");
  const [image, setImage] = useState(
    initialData?.image ||
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80"
  );
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [specs, setSpecs] = useState<string[]>(initialData?.specs || []);
  const [specInput, setSpecInput] = useState("");
  const [inStock, setInStock] = useState(initialData?.inStock !== false);
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [published, setPublished] = useState(initialData?.published !== false);
  const [order, setOrder] = useState<number>(initialData?.order || 0);

  // Media Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"main" | "gallery">("main");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      });
  }, []);

  function handleAddSpec() {
    if (specInput.trim()) {
      setSpecs([...specs, specInput.trim()]);
      setSpecInput("");
    }
  }

  function handleRemoveSpec(index: number) {
    setSpecs(specs.filter((_, i) => i !== index));
  }

  function handleRemoveGalleryImage(index: number) {
    setGallery(gallery.filter((_, i) => i !== index));
  }

  function openMediaPicker(target: "main" | "gallery") {
    setPickerTarget(target);
    setPickerOpen(true);
  }

  function handleSelectMedia(url: string) {
    if (pickerTarget === "main") {
      setImage(url);
    } else {
      setGallery([...gallery, url]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!category) {
        throw new Error("Please select a category");
      }

      const payload = {
        name,
        slug: slug.trim() || undefined,
        sku,
        brand,
        category,
        shortDescription,
        description,
        price: price ? parseFloat(price) : undefined,
        currency,
        image,
        gallery,
        specs,
        inStock,
        featured,
        published,
        order: Number(order) || 0,
      };

      const url = isEdit
        ? `/api/admin/products/${initialData?._id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      setSuccess("Product saved successfully!");
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-xs text-steel">
            Fill in product parameters, images, specifications, and availability.
          </p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="rounded border border-line bg-white px-3.5 sm:px-4 py-2 text-xs font-bold uppercase text-navy hover:bg-paper transition flex-1 sm:flex-none text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-orange px-5 sm:px-6 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50 flex-1 sm:flex-none text-center"
          >
            {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded border border-emerald-500/30 bg-emerald-50 p-3 text-xs text-emerald-600 font-bold">
          {success}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[2fr_1fr]">
        {/* Main Left Column */}
        <div className="space-y-6">
          {/* General Info */}
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              General Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SIMATIC S7-1200 CPU 1214C"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium text-navy"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Category *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange bg-white text-navy font-medium"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Brand / Class
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Siemens, Delta, Omron, ABB"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  SKU / Model Number
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. 6ES7 214-1AG40-0XB0"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Custom Slug (optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated from name if blank"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Short Description (Card summary) *
              </label>
              <textarea
                required
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Compact 1-2 sentence description for catalog cards"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Full Description (Overview section) *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive technical details, operating characteristics and variant information"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed"
              />
            </div>
          </div>

          {/* Specifications Table Builder */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Technical Specifications
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Supply: 24 VDC or Output: 14 DI / 10 DO"
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSpec();
                  }
                }}
                className="flex-1 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="btn-navy px-4 py-2 text-xs font-bold"
              >
                + Add Spec
              </button>
            </div>

            {specs.length > 0 ? (
              <ul className="space-y-2">
                {specs.map((spec, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded border border-line bg-paper/50 px-3 py-2 text-xs text-navy"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(i)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-mist">No specifications added yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Images & Publish Settings */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Publish & Inventory
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange"
                />
                <span className="text-xs font-bold text-navy">Published (Visible on site)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange"
                />
                <span className="text-xs font-bold text-navy">In Stock (Available for prompt supply)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded accent-orange"
                />
                <span className="text-xs font-bold text-navy">Featured on Homepage</span>
              </label>
            </div>

            <div className="pt-2 border-t border-line">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Display Order Priority
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
              />
              <p className="mt-1 text-[10.5px] text-mist">Lower number = appears earlier in listing</p>
            </div>
          </div>

          {/* Pricing (Optional) */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Price Reference (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Price (BDT)</label>
                <input
                  type="number"
                  placeholder="e.g. 18500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Primary Image */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                Primary Image *
              </h3>
              <button
                type="button"
                onClick={() => openMediaPicker("main")}
                className="text-xs font-bold text-orange hover:underline"
              >
                Change Image 🖼️
              </button>
            </div>

            <div className="relative aspect-square overflow-hidden rounded border border-line bg-paper/50">
              <Img
                src={image}
                alt="Product Preview"
                fill
                className="object-contain p-3"
                sizes="250px"
              />
            </div>
            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... or /uploads/..."
              className="w-full rounded border border-line px-3 py-1.5 text-[11px] outline-none text-steel"
            />
          </div>

          {/* Gallery Images */}
          <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                Additional Gallery ({gallery.length})
              </h3>
              <button
                type="button"
                onClick={() => openMediaPicker("gallery")}
                className="text-xs font-bold text-orange hover:underline"
              >
                + Add Image 🖼️
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {gallery.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded border border-line bg-paper/50"
                >
                  <Img src={url} alt="" fill className="object-cover" sizes="80px" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(i)}
                    className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded bg-red-600 text-[10px] text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectMedia}
      />
    </form>
  );
}
