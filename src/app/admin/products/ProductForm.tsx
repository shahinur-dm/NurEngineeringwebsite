"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Img } from "@/components/Img";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { youtubeId } from "@/lib/product-media";

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  category: string | { _id: string };
}

interface SpecRow {
  label: string;
  value: string;
}

interface ProductFormProps {
  initialData?: {
    _id?: string;
    name: string;
    slug?: string;
    sku?: string;
    brand?: string;
    category: string | { _id: string };
    subCategory?: string | { _id: string };
    shortDescription: string;
    description: string;
    price?: number;
    currency: string;
    image: string;
    gallery?: string[];
    videoUrl?: string;
    specs?: string[];
    specTable?: SpecRow[];
    condition?: string;
    packing?: string;
    warranty?: string;
    warrantyAndReturns?: string;
    availabilityText?: string;
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
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // General Fields
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [category, setCategory] = useState(
    typeof initialData?.category === "object"
      ? initialData.category._id
      : initialData?.category || ""
  );
  const [subCategory, setSubCategory] = useState(
    typeof initialData?.subCategory === "object"
      ? initialData.subCategory._id
      : initialData?.subCategory || ""
  );
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  // Specifications
  const [specTable, setSpecTable] = useState<SpecRow[]>(
    initialData?.specTable || []
  );
  const [specLabelInput, setSpecLabelInput] = useState("");
  const [specValueInput, setSpecValueInput] = useState("");

  const [specs, setSpecs] = useState<string[]>(initialData?.specs || []);
  const [specInput, setSpecInput] = useState("");

  // Warranty, Condition, Packing, Availability
  const [warranty, setWarranty] = useState(
    initialData?.warranty || "12-month manufacturer warranty"
  );
  const [condition, setCondition] = useState(
    initialData?.condition || "100% Genuine, Authorised Stock"
  );
  const [packing, setPacking] = useState(initialData?.packing || "Carton");
  const [availabilityText, setAvailabilityText] = useState(
    initialData?.availabilityText || "In stock – confirm lead time"
  );
  const [warrantyAndReturns, setWarrantyAndReturns] = useState(
    initialData?.warrantyAndReturns || ""
  );

  // Pricing & Stock
  const [price, setPrice] = useState<string>(
    initialData?.price ? String(initialData.price) : ""
  );
  const [currency, setCurrency] = useState(initialData?.currency || "BDT");
  const [inStock, setInStock] = useState(initialData?.inStock !== false);
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [published, setPublished] = useState(initialData?.published !== false);
  const [order, setOrder] = useState<number>(initialData?.order || 0);

  // Media Management
  const [image, setImage] = useState(
    initialData?.image ||
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80"
  );
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Media Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"main" | "gallery">("main");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      })
      .catch((err) => console.error("Categories fetch error:", err));
  }, []);

  useEffect(() => {
    if (!category) {
      setSubCategories([]);
      return;
    }
    fetch(`/api/admin/subcategories?categoryId=${category}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.subcategories) setSubCategories(d.subcategories);
      })
      .catch((err) => console.error("Subcategories fetch error:", err));
  }, [category]);

  // Gallery manipulation handlers
  function handleSetAsMainImage(index: number) {
    const selected = gallery[index];
    if (!selected) return;
    const oldMain = image;
    const updatedGallery = gallery.filter((_, i) => i !== index);
    if (oldMain && !updatedGallery.includes(oldMain)) {
      updatedGallery.unshift(oldMain);
    }
    setImage(selected);
    setGallery(updatedGallery);
  }

  function handleMoveGalleryImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    const copy = [...gallery];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setGallery(copy);
  }

  function handleRemoveGalleryImage(index: number) {
    setGallery(gallery.filter((_, i) => i !== index));
  }

  function handleAddGalleryUrl() {
    if (customImageUrl.trim()) {
      setGallery([...gallery, customImageUrl.trim()]);
      setCustomImageUrl("");
    }
  }

  function openMediaPicker(target: "main" | "gallery") {
    setPickerTarget(target);
    setPickerOpen(true);
  }

  function handleSelectMedia(url: string) {
    if (pickerTarget === "main") {
      setImage(url);
    } else {
      if (!gallery.includes(url)) {
        setGallery([...gallery, url]);
      }
    }
  }

  // Specifications handlers
  function handleAddSpecRow() {
    if (specLabelInput.trim() && specValueInput.trim()) {
      setSpecTable([
        ...specTable,
        { label: specLabelInput.trim(), value: specValueInput.trim() },
      ]);
      setSpecLabelInput("");
      setSpecValueInput("");
    }
  }

  function handleRemoveSpecRow(index: number) {
    setSpecTable(specTable.filter((_, i) => i !== index));
  }

  function handleAddSpec() {
    if (specInput.trim()) {
      setSpecs([...specs, specInput.trim()]);
      setSpecInput("");
    }
  }

  function handleRemoveSpec(index: number) {
    setSpecs(specs.filter((_, i) => i !== index));
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
      if (!image.trim()) {
        throw new Error("Primary product image is required");
      }

      const payload = {
        name,
        slug: slug.trim() || undefined,
        sku,
        brand,
        category,
        subCategory: subCategory || null,
        shortDescription,
        description,
        price: price ? parseFloat(price) : undefined,
        currency,
        image,
        gallery,
        videoUrl: videoUrl.trim() || undefined,
        specs,
        specTable,
        condition,
        packing,
        warranty,
        warrantyAndReturns,
        availabilityText,
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

      setSuccess("Product and media saved successfully!");
      if (!isEdit) {
        router.push("/admin/products");
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const yt = youtubeId(videoUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            {isEdit ? "Edit Machine Part & Media" : "Add New Machine Part"}
          </h2>
          <p className="text-xs text-steel">
            Manage product content, specifications, gallery images, video, and availability.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="rounded border border-line px-4 py-2 text-xs font-bold text-steel hover:bg-paper flex-1 sm:flex-none text-center"
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
        <div className="rounded border border-red-500/30 bg-red-50 p-3 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded border border-emerald-500/30 bg-emerald-50 p-3 text-xs text-emerald-600 font-bold">
          {success}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.6fr_1.1fr]">
        {/* Main Left Column: Content, Specs, Warranty */}
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
                placeholder="e.g. 7-INCH HMI TOUCH PANEL"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-semibold text-navy"
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
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubCategory("");
                  }}
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
                  Sub-Category (Optional)
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={!category || subCategories.length === 0}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange bg-white text-navy font-medium disabled:bg-paper/80 disabled:text-mist"
                >
                  <option value="">
                    {!category
                      ? "Select Category First"
                      : subCategories.length === 0
                      ? "No sub-categories available"
                      : "Select sub-category..."}
                  </option>
                  {subCategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Brand / Class
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Weintek / Delta class"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  SKU / Model Number
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. NES-HMI-7"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Custom Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from name if left empty"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Short Product Description *
              </label>
              <textarea
                required
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="7-inch industrial HMI with Ethernet and serial."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed text-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Full Description (Description Tab Content) *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The 7-inch HMI touch panel delivers reliable performance for industrial automation applications..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed"
              />
            </div>
          </div>

          {/* Technical Specifications Table Builder */}
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-line pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                  Technical Specifications Table
                </h3>
                <p className="text-[11px] text-steel">
                  Add Parameter / Value pairs displayed in the Specifications Tab & technical view.
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                placeholder="Parameter (e.g. Display Size)"
                value={specLabelInput}
                onChange={(e) => setSpecLabelInput(e.target.value)}
                className="rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
              />
              <input
                type="text"
                placeholder="Value (e.g. 7.0 inch TFT LCD)"
                value={specValueInput}
                onChange={(e) => setSpecValueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSpecRow();
                  }
                }}
                className="rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
              />
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="btn-orange px-4 py-2 text-xs font-bold uppercase"
              >
                + Add Row
              </button>
            </div>

            {specTable.length > 0 ? (
              <div className="overflow-x-auto border border-line">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-paper/80 border-b border-line text-navy font-bold uppercase text-[10.5px]">
                      <th className="py-2 px-3">Parameter</th>
                      <th className="py-2 px-3">Specification Value</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {specTable.map((row, i) => (
                      <tr key={i} className="hover:bg-paper/30">
                        <td className="py-2 px-3 font-medium text-steel">{row.label}</td>
                        <td className="py-2 px-3 font-semibold text-navy">{row.value}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecRow(i)}
                            className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-xs"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-mist">No specification rows added yet.</p>
            )}

            {/* Quick Specs Tags (Optional) */}
            <div className="pt-3 border-t border-line">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                Quick Feature Bullet Points (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ethernet 10/100 Mbps or IP65 front"
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
                  + Add
                </button>
              </div>

              {specs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {specs.map((spec, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded border border-line bg-paper px-2.5 py-1 text-xs text-navy font-medium"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(i)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warranty, Condition, Packing & Return Policy */}
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Warranty, Condition & Commercial Terms
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Condition
                </label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Weintek / Delta class as quoted"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Packaging
                </label>
                <input
                  type="text"
                  value={packing}
                  onChange={(e) => setPacking(e.target.value)}
                  placeholder="e.g. Carton / Factory sealed"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Warranty Summary
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g. As quoted / 12-month manufacturer warranty"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                  Availability / Lead Time Note
                </label>
                <input
                  type="text"
                  value={availabilityText}
                  onChange={(e) => setAvailabilityText(e.target.value)}
                  placeholder="e.g. In stock – confirm lead time"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                Warranty & Returns Policy (Warranty Tab Content)
              </label>
              <textarea
                rows={4}
                value={warrantyAndReturns}
                onChange={(e) => setWarrantyAndReturns(e.target.value)}
                placeholder="Details on warranty claim, replacement policy, defect inspection and delivery terms..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Media Management (Images, Video, Gallery, Publish) */}
        <div className="space-y-6">
          {/* Primary Product Image */}
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                  Primary Product Image *
                </h3>
                <p className="text-[11px] text-steel">Main image shown on catalog & page.</p>
              </div>
              <button
                type="button"
                onClick={() => openMediaPicker("main")}
                className="text-xs font-bold text-orange hover:underline"
              >
                Media Library
              </button>
            </div>

            <div className="relative aspect-square overflow-hidden rounded border border-line bg-white flex items-center justify-center p-3">
              <Img
                src={image}
                alt="Main Product"
                fill
                className="object-contain p-2"
                sizes="300px"
              />
            </div>

            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Image URL: https://... or /uploads/..."
              className="w-full rounded border border-line px-3 py-1.5 text-[11px] outline-none text-steel focus:border-orange"
            />
          </div>

          {/* Additional Gallery Images */}
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                  Gallery Images ({gallery.length})
                </h3>
                <p className="text-[11px] text-steel">Add, reorder, or set any image as primary.</p>
              </div>
              <button
                type="button"
                onClick={() => openMediaPicker("gallery")}
                className="text-xs font-bold text-orange hover:underline flex items-center gap-1"
              >
                <span>+ Pick Media</span>
              </button>
            </div>

            {/* Custom URL Input for Gallery */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste image URL here..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="flex-1 rounded border border-line px-2.5 py-1.5 text-xs outline-none focus:border-orange"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="rounded border border-line bg-paper px-3 py-1.5 text-xs font-bold text-navy hover:bg-paper/80"
              >
                Add URL
              </button>
            </div>

            {/* Gallery Grid */}
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {gallery.map((url, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded border border-line bg-white p-1 flex flex-col justify-between shadow-2xs"
                  >
                    <div className="relative h-full w-full">
                      <Img
                        src={url}
                        alt={`Gallery item ${i + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="120px"
                      />
                    </div>

                    {/* Action Controls Overlay */}
                    <div className="absolute inset-0 bg-navy/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 text-white">
                      <button
                        type="button"
                        onClick={() => handleSetAsMainImage(i)}
                        className="rounded bg-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow"
                        title="Set this image as primary product image"
                      >
                        ★ Set Main
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => handleMoveGalleryImage(i, -1)}
                          className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 text-xs font-bold disabled:opacity-30"
                          title="Move Left"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          disabled={i === gallery.length - 1}
                          onClick={() => handleMoveGalleryImage(i, 1)}
                          className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 text-xs font-bold disabled:opacity-30"
                          title="Move Right"
                        >
                          ▶
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="h-6 w-6 rounded bg-red-600 hover:bg-red-700 text-xs font-bold"
                          title="Delete image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-mist">No additional gallery images added.</p>
            )}
          </div>

          {/* Product Video Management */}
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                  Product Video
                </h3>
                <p className="text-[11px] text-steel">YouTube or direct MP4 video URL.</p>
              </div>
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Remove Video
                </button>
              )}
            </div>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or /uploads/demo.mp4"
              className="w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
            />

            {videoUrl && (
              <div className="rounded border border-line bg-paper/40 p-2.5">
                <p className="text-[11px] font-bold text-navy mb-1.5 uppercase tracking-wider">
                  Video Preview:
                </p>
                {yt ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
                    <iframe
                      title="Admin Video Preview"
                      src={`https://www.youtube-nocookie.com/embed/${yt}`}
                      className="absolute inset-0 h-full w-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-black flex items-center justify-center text-white text-xs">
                    <video src={videoUrl} controls className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status & Pricing */}
          <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
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
                <span className="text-xs font-bold text-navy">In Stock (Available)</span>
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

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line">
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
