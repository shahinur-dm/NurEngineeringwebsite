import { connectDB } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import {
  SiteSettings,
  Category,
  Product,
  Service,
  Banner,
  CompanyProfile,
  UseCase,
  type ISiteSettings,
  type ICategory,
  type IProduct,
  type IService,
  type IBanner,
  type ICompanyProfile,
  type IUseCase,
} from "@/lib/models";
import { navLinks, useCaseContent } from "@/lib/use-cases";

export type PopulatedProduct = Omit<IProduct, "category" | "relatedServices"> & {
  category: ICategory;
  relatedServices: IService[];
};

export type PopulatedService = Omit<IService, "category" | "relatedProducts"> & {
  category?: ICategory | null;
  relatedProducts: IProduct[];
};

export const fallbackSettings: ISiteSettings = {
  _id: "fallback",
  brandName: "Nur Engineering Solution",
  tagline: "Machine, spare parts and Technical service provider",
  description:
    "EEE-led supplier of PLC, motors, drives, sensors, and industrial spare parts with technical service across Bangladesh.",
  email: "info@nurengineering.com",
  phone: "+880 1700-000000",
  address: "Dhaka, Bangladesh",
  hours: "Sat–Thu 9:00–18:00",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Dhaka%2C%20Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed",
  social: {
    facebook: "https://www.facebook.com/",
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
  seo: {
    defaultTitle:
      "Nur Engineering Solution | Machine Parts & Technical Service",
    defaultDescription:
      "Buy PLC, motors, VFD, sensors, contactors and industrial spare parts. Technical service from an EEE engineering desk in Bangladesh.",
    keywords: [
      "PLC Bangladesh",
      "machine parts",
      "VFD",
      "motors",
      "sensors",
      "EEE spare parts",
    ],
  },
  analytics: {},
  nav: navLinks,
};

export async function getSettings(): Promise<ISiteSettings> {
  try {
    await connectDB();
    const doc = await SiteSettings.findOne().lean<ISiteSettings | null>();
    const base = serialize(doc ?? fallbackSettings);
    return {
      ...base,
      analytics: {
        gaMeasurementId:
          base.analytics?.gaMeasurementId ||
          process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
          "",
        googleSiteVerification:
          base.analytics?.googleSiteVerification ||
          process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
          "",
      },
    };
  } catch {
    return {
      ...fallbackSettings,
      analytics: {
        gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
        googleSiteVerification:
          process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
      },
    };
  }
}

export async function getCompany(): Promise<ICompanyProfile | null> {
  await connectDB();
  const doc = await CompanyProfile.findOne().lean<ICompanyProfile | null>();
  return doc ? serialize(doc) : null;
}

export async function getCategories(
  type?: "product" | "service"
): Promise<ICategory[]> {
  await connectDB();
  const filter = type ? { type } : {};
  const docs = await Category.find(filter)
    .sort({ order: 1 })
    .lean<ICategory[]>();
  return serialize(docs);
}

export async function getBanners(): Promise<IBanner[]> {
  await connectDB();
  const docs = await Banner.find({ active: true })
    .sort({ order: 1 })
    .lean<IBanner[]>();
  return serialize(docs);
}

export async function getServices(opts?: {
  featured?: boolean;
}): Promise<PopulatedService[]> {
  await connectDB();
  const filter: Record<string, unknown> = { published: true };
  if (opts?.featured) filter.featured = true;
  const docs = await Service.find(filter)
    .populate("category")
    .populate({ path: "relatedProducts", populate: { path: "category" } })
    .sort({ order: 1 })
    .lean<PopulatedService[]>();
  return serialize(docs);
}

export async function getServiceBySlug(
  slug: string
): Promise<PopulatedService | null> {
  await connectDB();
  const doc = await Service.findOne({ slug, published: true })
    .populate("category")
    .populate({ path: "relatedProducts", populate: { path: "category" } })
    .lean<PopulatedService | null>();
  return doc ? serialize(doc) : null;
}

export async function getProducts(opts?: {
  featured?: boolean;
  categorySlug?: string;
  q?: string;
  limit?: number;
}): Promise<PopulatedProduct[]> {
  await connectDB();
  const filter: Record<string, unknown> = { published: true };
  if (opts?.featured) filter.featured = true;
  if (opts?.categorySlug) {
    const cat = await Category.findOne({
      slug: opts.categorySlug,
      type: "product",
    }).lean<ICategory | null>();
    if (cat) filter.category = cat._id;
    else return [];
  }
  if (opts?.q) {
    filter.$or = [
      { name: { $regex: opts.q, $options: "i" } },
      { shortDescription: { $regex: opts.q, $options: "i" } },
      { sku: { $regex: opts.q, $options: "i" } },
      { brand: { $regex: opts.q, $options: "i" } },
    ];
  }
  let query = Product.find(filter)
    .populate("category")
    .populate("relatedServices")
    .sort({ featured: -1, createdAt: -1 });
  if (opts?.limit) query = query.limit(opts.limit);
  const docs = await query.lean<PopulatedProduct[]>();
  return serialize(docs);
}

export async function getProductBySlug(
  slug: string
): Promise<PopulatedProduct | null> {
  await connectDB();
  const doc = await Product.findOne({ slug, published: true })
    .populate("category")
    .populate("relatedServices")
    .lean<PopulatedProduct | null>();
  return doc ? serialize(doc) : null;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<PopulatedProduct[]> {
  await connectDB();
  const docs = await Product.find({
    category: categoryId,
    slug: { $ne: excludeSlug },
    published: true,
  })
    .populate("category")
    .limit(limit)
    .lean<PopulatedProduct[]>();
  return serialize(docs);
}

function toUseCaseDoc(item: (typeof useCaseContent)[number]): IUseCase {
  return {
    _id: item.slug,
    ...item,
    published: true,
  };
}

export async function getUseCases(): Promise<IUseCase[]> {
  try {
    await connectDB();
    const docs = await UseCase.find({ published: true })
      .sort({ order: 1 })
      .lean<IUseCase[]>();
    if (docs.length) return serialize(docs);
  } catch {
    // fall through to editorial content
  }
  return useCaseContent.map(toUseCaseDoc);
}

export async function getUseCaseBySlug(slug: string): Promise<IUseCase | null> {
  try {
    await connectDB();
    const doc = await UseCase.findOne({ slug, published: true }).lean<IUseCase | null>();
    if (doc) return serialize(doc);
  } catch {
    // fall through
  }
  const local = useCaseContent.find((item) => item.slug === slug);
  return local ? toUseCaseDoc(local) : null;
}

