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
  footerQr?: {
    wechatQr?: string;
    wechatQrLabel?: string;
    wechatQrEnabled?: boolean;
    whatsappQr?: string;
    whatsappQrLabel?: string;
    whatsappQrEnabled?: boolean;
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
    brandName: { type: String, default: "Nur Engineering Solution" },
    tagline: { type: String, default: "Machine, spare parts and Technical service provider" },
    description: {
      type: String,
      default:
        "EEE-led supplier of PLC, motors, drives, sensors, and industrial spare parts with technical service across Bangladesh.",
    },
    email: { type: String, default: "info@nurengineering.com" },
    phone: { type: String, default: "+880 1700-000000" },
    address: { type: String, default: "Dhaka, Bangladesh" },
    hours: { type: String, default: "Sat–Thu 9:00–18:00" },
    mapEmbedUrl: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    favicon: { type: String, default: "" },
    notice: {
      type: String,
      default: "Out of stock products will be delivered within 3-5 days.",
    },
    social: {
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
    footerQr: {
      wechatQr: { type: String, default: "" },
      wechatQrLabel: { type: String, default: "WECHAT QR SCAN" },
      wechatQrEnabled: { type: Boolean, default: true },
      whatsappQr: { type: String, default: "" },
      whatsappQrLabel: { type: String, default: "WHATSAPP QR SCAN" },
      whatsappQrEnabled: { type: Boolean, default: true },
    },
    seo: {
      defaultTitle: {
        type: String,
        default: "Nur Engineering Solution | Machine Parts & Technical Service",
      },
      defaultDescription: {
        type: String,
        default:
          "Buy PLC, motors, VFD, sensors, contactors and industrial spare parts. Technical service from an EEE engineering desk in Bangladesh.",
      },
      keywords: [{ type: String }],
    },
    analytics: {
      gaMeasurementId: { type: String, default: "" },
      googleSiteVerification: { type: String, default: "" },
    },
    nav: [
      {
        href: { type: String, default: "" },
        label: { type: String, default: "" },
        order: { type: Number, default: 0 },
        _id: false,
      },
    ],
  },
  { timestamps: true, strict: false }
);

export const SiteSettings =
  models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
