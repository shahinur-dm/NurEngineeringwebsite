import { Schema, models, model, type Types } from "mongoose";

export interface IProduct {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  sku?: string;
  brand?: string;
  category: Types.ObjectId | string;
  subCategory?: Types.ObjectId | string;
  shortDescription: string;
  description: string;
  price?: number;
  currency: string;
  image: string;
  gallery?: string[];
  specs: string[];
  relatedServices?: (Types.ObjectId | string)[];
  inStock: boolean;
  featured: boolean;
  published: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: String,
    brand: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      index: true,
    },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    price: Number,
    currency: { type: String, default: "BDT" },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    specs: [{ type: String }],
    relatedServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", shortDescription: "text", sku: "text" });

export const Product =
  models.Product || model<IProduct>("Product", ProductSchema);
