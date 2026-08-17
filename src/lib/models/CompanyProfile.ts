import { Schema, models, model, type Types } from "mongoose";

export interface ICompanyProfile {
  _id: Types.ObjectId | string;
  name: string;
  tagline: string;
  about: string;
  mission: string;
  vision: string;
  foundedYear: number;
  email: string;
  phone: string;
  address: string;
  coverImage?: string;
  highlights: { label: string; value: string }[];
}

const CompanyProfileSchema = new Schema<ICompanyProfile>(
  {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    about: { type: String, required: true },
    mission: { type: String, required: true },
    vision: { type: String, required: true },
    foundedYear: { type: Number, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    coverImage: String,
    highlights: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const CompanyProfile =
  models.CompanyProfile ||
  model<ICompanyProfile>("CompanyProfile", CompanyProfileSchema);
