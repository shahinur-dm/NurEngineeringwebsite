import { Schema, models, model, type Types } from "mongoose";

export interface ISiteSettings {
  _id: Types.ObjectId | string;
  brandName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  mapEmbedUrl: string;
  logoUrl?: string;
  favicon?: string;
  notice?: string;
  social: {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
  };
  analytics: {
    gaMeasurementId?: string;
    googleSiteVerification?: string;
  };
  nav: { href: string; label: string; order: number }[];
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    brandName: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    hours: { type: String, default: "Sat–Thu 9:00–18:00" },
    mapEmbedUrl: { type: String, default: "" },
    logoUrl: String,
    favicon: String,
    notice: {
      type: String,
      default: "Out of stock products will be delivered within 3-5 days.",
    },
    social: {
      facebook: String,
      linkedin: String,
      instagram: String,
      youtube: String,
      whatsapp: String,
    },
    seo: {
      defaultTitle: { type: String, required: true },
      defaultDescription: { type: String, required: true },
      keywords: [{ type: String }],
    },
    analytics: {
      gaMeasurementId: String,
      googleSiteVerification: String,
    },
    nav: [
      {
        href: { type: String, required: true },
        label: { type: String, required: true },
        order: { type: Number, default: 0 },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export const SiteSettings =
  models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
