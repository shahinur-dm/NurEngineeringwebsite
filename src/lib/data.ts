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
  BlogPost,
  BlogCategory,
  type ISiteSettings,
  type ICategory,
  type IProduct,
  type IService,
  type IBanner,
  type ICompanyProfile,
  type IUseCase,
  type IBlogPost,
  type IBlogCategory,
} from "@/lib/models";
import { navLinks, useCaseContent } from "@/lib/use-cases";
import {
  mockCategories,
  mockBanners,
  mockServices,
  mockProducts,
  mockBlogCategories,
  mockBlogPosts,
  type IMockBlogPost,
  type IMockBlogCategory,
} from "@/lib/mock-data";

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

function getMockPopulatedProducts(): PopulatedProduct[] {
  const catMap = new Map(mockCategories.map((c) => [String(c._id), c]));
  const svcMap = new Map(mockServices.map((s) => [String(s._id), s]));
  return mockProducts.map((p) => ({
    ...p,
    category:
      catMap.get(String(p.category)) ||
      mockCategories.find((c) => c.slug === "plc") ||
      mockCategories[0],
    relatedServices: (p.relatedServices || [])
      .map((sid) => svcMap.get(String(sid)))
      .filter(Boolean) as IService[],
  }));
}

function getMockPopulatedServices(): PopulatedService[] {
  const catMap = new Map(mockCategories.map((c) => [String(c._id), c]));
  return mockServices.map((s) => ({
    ...s,
    category: s.category ? catMap.get(String(s.category)) || null : null,
    relatedProducts: [],
  }));
}

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
  try {
    await connectDB();
    const doc = await CompanyProfile.findOne().lean<ICompanyProfile | null>();
    return doc ? serialize(doc) : null;
  } catch {
    return null;
  }
}

export async function getCategories(
  type?: "product" | "service"
): Promise<ICategory[]> {
  try {
    await connectDB();
    const filter = type ? { type } : {};
    const docs = await Category.find(filter)
      .sort({ order: 1 })
      .lean<ICategory[]>();
    if (docs.length) return serialize(docs);
  } catch {
    // fall through to mock
  }
  const filtered = type ? mockCategories.filter((c) => c.type === type) : mockCategories;
  return serialize(filtered);
}

export async function getBanners(): Promise<IBanner[]> {
  try {
    await connectDB();
    const docs = await Banner.find({ active: true })
      .sort({ order: 1 })
      .lean<IBanner[]>();
    if (docs.length) return serialize(docs);
  } catch {
    // fall through to mock
  }
  return serialize(mockBanners);
}

export async function getServices(opts?: {
  featured?: boolean;
}): Promise<PopulatedService[]> {
  try {
    await connectDB();
    const filter: Record<string, unknown> = { published: true };
    if (opts?.featured) filter.featured = true;
    const docs = await Service.find(filter)
      .populate("category")
      .populate({ path: "relatedProducts", populate: { path: "category" } })
      .sort({ order: 1 })
      .lean<PopulatedService[]>();
    if (docs.length) return serialize(docs);
  } catch {
    // fall through to mock
  }
  let res = getMockPopulatedServices();
  if (opts?.featured) res = res.filter((s) => s.featured);
  return serialize(res);
}

export async function getServiceBySlug(
  slug: string
): Promise<PopulatedService | null> {
  try {
    await connectDB();
    const doc = await Service.findOne({ slug, published: true })
      .populate("category")
      .populate({ path: "relatedProducts", populate: { path: "category" } })
      .lean<PopulatedService | null>();
    if (doc) return serialize(doc);
  } catch {
    // fall through to mock
  }
  const s = getMockPopulatedServices().find((item) => item.slug === slug);
  return s ? serialize(s) : null;
}

export async function getProducts(opts?: {
  featured?: boolean;
  categorySlug?: string;
  q?: string;
  limit?: number;
}): Promise<PopulatedProduct[]> {
  try {
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
      .sort({ order: 1, featured: -1, createdAt: -1 });
    if (opts?.limit) query = query.limit(opts.limit);
    const docs = await query.lean<PopulatedProduct[]>();
    if (docs.length) return serialize(docs);
  } catch {
    // fall through to mock
  }
  let list = getMockPopulatedProducts();
  if (opts?.featured) list = list.filter((p) => p.featured);
  if (opts?.categorySlug) list = list.filter((p) => p.category.slug === opts.categorySlug);
  if (opts?.q) {
    const qLower = opts.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        p.shortDescription.toLowerCase().includes(qLower) ||
        (p.sku && p.sku.toLowerCase().includes(qLower))
    );
  }
  list.sort((a, b) => (a.order || 999) - (b.order || 999));
  if (opts?.limit) list = list.slice(0, opts.limit);
  return serialize(list);
}

export async function getProductBySlug(
  slug: string
): Promise<PopulatedProduct | null> {
  try {
    await connectDB();
    const doc = await Product.findOne({ slug, published: true })
      .populate("category")
      .populate("relatedServices")
      .lean<PopulatedProduct | null>();
    if (doc) return serialize(doc);
  } catch {
    // fall through to mock
  }
  const p = getMockPopulatedProducts().find((item) => item.slug === slug);
  return p ? serialize(p) : null;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<PopulatedProduct[]> {
  try {
    await connectDB();
    const primaryDocs = await Product.find({
      category: categoryId,
      slug: { $ne: excludeSlug },
      published: true,
    })
      .populate("category")
      .populate("relatedServices")
      .sort({ order: 1, _id: 1 })
      .limit(limit)
      .lean<PopulatedProduct[]>();

    if (primaryDocs && primaryDocs.length >= limit) {
      return serialize(primaryDocs);
    }

    const existingIds = (primaryDocs || []).map((d) => String(d._id));
    const extraNeeded = limit - (primaryDocs ? primaryDocs.length : 0);

    const fallbackDocs = await Product.find({
      _id: { $nin: existingIds },
      slug: { $ne: excludeSlug },
      published: true,
    })
      .populate("category")
      .populate("relatedServices")
      .sort({ featured: -1, order: 1, _id: 1 })
      .limit(extraNeeded)
      .lean<PopulatedProduct[]>();

    return serialize([...(primaryDocs || []), ...(fallbackDocs || [])]);
  } catch {
    // fall through to mock
  }

  const allMock = getMockPopulatedProducts().filter((p) => p.slug !== excludeSlug);
  const sameCat = allMock.filter(
    (p) =>
      String(p.category._id) === String(categoryId) ||
      p.category.slug === categoryId
  );
  const otherCat = allMock.filter(
    (p) =>
      String(p.category._id) !== String(categoryId) &&
      p.category.slug !== categoryId
  );

  sameCat.sort((a, b) => (a.order || 999) - (b.order || 999));
  otherCat.sort((a, b) => (a.order || 999) - (b.order || 999));

  return serialize([...sameCat, ...otherCat].slice(0, limit));
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

export type PopulatedBlogPost = Omit<IBlogPost, "category" | "_id"> & {
  _id: string;
  category?: { _id: string; name: string; slug: string } | null;
  readTime?: string;
};

export async function getBlogCategories(): Promise<IMockBlogCategory[]> {
  try {
    await connectDB();
    const docs = await BlogCategory.find({ active: true })
      .sort({ order: 1, name: 1 })
      .lean();
    if (docs.length) return serialize(docs) as unknown as IMockBlogCategory[];
  } catch {
    // fall through
  }
  return mockBlogCategories;
}

export async function getBlogPosts(options?: {
  categorySlug?: string;
  limit?: number;
}): Promise<PopulatedBlogPost[]> {
  try {
    await connectDB();
    const filter: Record<string, unknown> = { status: "published" };
    if (options?.categorySlug) {
      const cat = await BlogCategory.findOne({ slug: options.categorySlug }).lean<{ _id: unknown } | null>();
      if (cat) filter.category = cat._id;
    }

    const query = BlogPost.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    if (options?.limit) {
      query.limit(options.limit);
    }

    const docs = await query.lean();
    if (docs.length) return serialize(docs) as unknown as PopulatedBlogPost[];
  } catch {
    // fall through
  }

  let posts = mockBlogPosts.filter((p) => p.status === "published");
  if (options?.categorySlug) {
    posts = posts.filter((p) => p.category.slug === options.categorySlug);
  }
  if (options?.limit) {
    posts = posts.slice(0, options.limit);
  }
  return posts as unknown as PopulatedBlogPost[];
}

export async function getBlogPostBySlug(
  slug: string
): Promise<PopulatedBlogPost | null> {
  try {
    await connectDB();
    const doc = await BlogPost.findOne({ slug, status: "published" })
      .populate("category", "name slug")
      .lean();
    if (doc) return serialize(doc) as unknown as PopulatedBlogPost;
  } catch {
    // fall through
  }

  const post = mockBlogPosts.find((p) => p.slug === slug);
  return (post as unknown as PopulatedBlogPost) || null;
}

export async function getRelatedBlogPosts(
  currentSlug: string,
  categorySlug?: string,
  limit = 3
): Promise<PopulatedBlogPost[]> {
  const allPosts = await getBlogPosts();
  const others = allPosts.filter((p) => p.slug !== currentSlug);
  if (!categorySlug) return others.slice(0, limit);

  const sameCat = others.filter(
    (p) => typeof p.category === "object" && p.category?.slug === categorySlug
  );
  const differentCat = others.filter(
    (p) => typeof p.category !== "object" || p.category?.slug !== categorySlug
  );
  return [...sameCat, ...differentCat].slice(0, limit);
}

