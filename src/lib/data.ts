import { connectDB } from "@/lib/mongodb";
import { serialize } from "@/lib/serialize";
import {
  SiteSettings,
  Category,
  SubCategory,
  Product,
  Service,
  Feature,
  Banner,
  CompanyProfile,
  UseCase,
  BlogPost,
  BlogCategory,
  Brand,
  type ISiteSettings,
  type ICategory,
  type ISubCategory,
  type IProduct,
  type IService,
  type IFeature,
  type IBanner,
  type ICompanyProfile,
  type IUseCase,
  type IBlogPost,
  type IBlogCategory,
  type IBrand,
} from "@/lib/models";
import { navLinks, useCaseContent } from "@/lib/use-cases";
import {
  mockCategories,
  mockSubCategories,
  mockSpecialFeatures,
  mockBanners,
  mockServices,
  mockProducts,
  mockBlogCategories,
  mockBlogPosts,
  type IMockBlogPost,
  type IMockBlogCategory,
  type IMockSpecialFeature,
} from "@/lib/mock-data";
import {
  getStoredCategories,
  getStoredSubCategories,
  getStoredBrands,
  getStoredProducts,
  getStoredProductByIdOrSlug,
  getStoredSettings,
} from "@/lib/store";

export type PopulatedProduct = Omit<IProduct, "category" | "subCategory" | "relatedServices"> & {
  category: ICategory;
  subCategory?: ISubCategory | null;
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
  notice: "Out of stock products will be delivered within 3-5 days.",
  social: {
    facebook: "https://www.facebook.com/",
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    whatsapp: "+880 1700-000000",
  },
  footerQr: {
    wechatQr: "",
    wechatQrLabel: "WECHAT QR SCAN",
    wechatQrEnabled: true,
    whatsappQr: "",
    whatsappQrLabel: "WHATSAPP QR SCAN",
    whatsappQrEnabled: true,
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
  const subMap = new Map(mockSubCategories.map((s) => [String(s._id), s]));
  const svcMap = new Map(mockServices.map((s) => [String(s._id), s]));
  return mockProducts.map((p) => ({
    ...p,
    category:
      catMap.get(String(p.category)) ||
      mockCategories[0],
    subCategory: p.subCategory ? subMap.get(String(p.subCategory)) || null : null,
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
  let doc: Record<string, unknown> | null = null;
  try {
    const db = await connectDB();
    if (db) {
      const found = await SiteSettings.findOne().lean<ISiteSettings | null>();
      if (found) doc = serialize(found) as unknown as Record<string, unknown>;
    }
  } catch (err) {
    console.warn("getSettings DB warning:", err);
  }

  const stored = getStoredSettings();
  const mem = (global as unknown as { inMemorySettingsCache?: Record<string, unknown> }).inMemorySettingsCache;
  const merged: Record<string, unknown> = {
    ...fallbackSettings,
    ...stored,
    ...(mem || {}),
    ...(doc || {}),
  };

  const rawSocial = {
    ...fallbackSettings.social,
    ...((stored.social as Record<string, string>) || {}),
    ...((mem?.social as Record<string, string>) || {}),
    ...((doc?.social as Record<string, string>) || {}),
  };

  const rawFooterQr = {
    ...fallbackSettings.footerQr,
    ...((stored.footerQr as Record<string, unknown>) || {}),
    ...((mem?.footerQr as Record<string, unknown>) || {}),
    ...((doc?.footerQr as Record<string, unknown>) || {}),
  };

  const rawSeo = {
    ...fallbackSettings.seo,
    ...((stored.seo as Record<string, unknown>) || {}),
    ...((mem?.seo as Record<string, unknown>) || {}),
    ...((doc?.seo as Record<string, unknown>) || {}),
  };

  const rawAnalytics = {
    ...fallbackSettings.analytics,
    ...((stored.analytics as Record<string, string>) || {}),
    ...((mem?.analytics as Record<string, string>) || {}),
    ...((doc?.analytics as Record<string, string>) || {}),
  };

  return {
    _id: (merged._id as string) || "site-settings",
    brandName: (merged.brandName as string) || fallbackSettings.brandName,
    tagline: (merged.tagline as string) || fallbackSettings.tagline,
    description: (merged.description as string) || fallbackSettings.description,
    email: (merged.email as string) || fallbackSettings.email,
    phone: (merged.phone as string) || fallbackSettings.phone,
    address: (merged.address as string) || fallbackSettings.address,
    hours: (merged.hours as string) || fallbackSettings.hours,
    mapEmbedUrl: (merged.mapEmbedUrl as string) || fallbackSettings.mapEmbedUrl,
    logoUrl: ((merged.logoUrl || merged.logo) as string) || "",
    favicon: (merged.favicon as string) || "",
    notice:
      (merged.notice as string) ||
      fallbackSettings.notice ||
      "Out of stock products will be delivered within 3-5 days.",
    social: {
      facebook: rawSocial.facebook || fallbackSettings.social?.facebook || "",
      linkedin: rawSocial.linkedin || fallbackSettings.social?.linkedin || "",
      instagram: rawSocial.instagram || fallbackSettings.social?.instagram || "",
      youtube: rawSocial.youtube || fallbackSettings.social?.youtube || "",
      whatsapp: rawSocial.whatsapp || fallbackSettings.social?.whatsapp || "+880170000000",
    },
    footerQr: {
      wechatQr: (rawFooterQr.wechatQr as string) || "",
      wechatQrLabel: (rawFooterQr.wechatQrLabel as string) || "WECHAT QR SCAN",
      wechatQrEnabled: rawFooterQr.wechatQrEnabled !== false,
      whatsappQr: (rawFooterQr.whatsappQr as string) || "",
      whatsappQrLabel: (rawFooterQr.whatsappQrLabel as string) || "WHATSAPP QR SCAN",
      whatsappQrEnabled: rawFooterQr.whatsappQrEnabled !== false,
    },
    seo: {
      defaultTitle: (rawSeo.defaultTitle as string) || fallbackSettings.seo.defaultTitle,
      defaultDescription: (rawSeo.defaultDescription as string) || fallbackSettings.seo.defaultDescription,
      keywords: Array.isArray(rawSeo.keywords) ? (rawSeo.keywords as string[]) : fallbackSettings.seo.keywords,
    },
    analytics: {
      gaMeasurementId:
        rawAnalytics.gaMeasurementId ||
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
        "",
      googleSiteVerification:
        rawAnalytics.googleSiteVerification ||
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        "",
    },
    nav: Array.isArray(merged.nav) && merged.nav.length ? (merged.nav as ISiteSettings["nav"]) : fallbackSettings.nav,
  };
}

export async function getCompany(): Promise<ICompanyProfile | null> {
  try {
    const db = await connectDB();
    if (db) {
      const doc = await CompanyProfile.findOne().lean<ICompanyProfile | null>();
      if (doc) return serialize(doc);
    }
  } catch (err) {
    console.warn("getCompany DB error:", err);
  }
  return null;
}

export async function getCategories(
  type?: "product" | "service"
): Promise<ICategory[]> {
  try {
    const db = await connectDB();
    if (db) {
      const count = await Category.countDocuments();
      if (count === 0) {
        for (const cat of mockCategories) {
          try {
            await Category.create({
              name: cat.name,
              slug: cat.slug,
              type: cat.type || "product",
              order: cat.order,
              description: cat.description,
              published: true,
            });
          } catch {
            // ignore duplicate
          }
        }
      }
      const filter = type ? { type } : {};
      const docs = await Category.find(filter)
        .sort({ order: 1, name: 1 })
        .lean<ICategory[]>();
      return serialize(docs);
    }
  } catch {
    // fall through to store
  }
  const storedCats = getStoredCategories(type);
  return serialize(storedCats) as unknown as ICategory[];
}

export async function getSubCategories(
  categorySlugOrId?: string
): Promise<ISubCategory[]> {
  try {
    const db = await connectDB();
    if (db) {
      const count = await SubCategory.countDocuments();
      if (count === 0) {
        for (const sub of mockSubCategories) {
          const parentMockCat = mockCategories.find((c) => c._id === sub.category);
          if (parentMockCat) {
            const dbParent = await Category.findOne({ slug: parentMockCat.slug });
            if (dbParent) {
              try {
                await SubCategory.create({
                  name: sub.name,
                  slug: sub.slug,
                  category: dbParent._id,
                  order: sub.order,
                  published: true,
                });
              } catch {
                // ignore duplicate
              }
            }
          }
        }
      }

      const filter: Record<string, unknown> = { published: { $ne: false } };
      if (categorySlugOrId) {
        if (categorySlugOrId.match(/^[0-9a-fA-F]{24}$/)) {
          filter.category = categorySlugOrId;
        } else {
          const cat = await Category.findOne({ slug: categorySlugOrId }).lean<ICategory | null>();
          if (cat) filter.category = cat._id;
          else return [];
        }
      }
      const docs = await SubCategory.find(filter)
        .sort({ order: 1, name: 1 })
        .lean<ISubCategory[]>();
      return serialize(docs);
    }
  } catch {
    // fall through to store
  }
  const storedSubs = getStoredSubCategories(categorySlugOrId);
  return serialize(storedSubs) as unknown as ISubCategory[];
}

export async function getBrands(): Promise<IBrand[]> {
  try {
    const db = await connectDB();
    if (db) {
      const count = await Brand.countDocuments();
      if (count === 0) {
        const defaultBrands = [
          { name: "Siemens", slug: "siemens", description: "Industrial Automation & Drives", active: true, order: 1 },
          { name: "Delta Electronics", slug: "delta", description: "VFD, PLC & Motion Control", active: true, order: 2 },
          { name: "Mitsubishi Electric", slug: "mitsubishi", description: "PLC, HMI & Inverters", active: true, order: 3 },
          { name: "Omron", slug: "omron", description: "Sensors, Relays & Timers", active: true, order: 4 },
          { name: "Schneider Electric", slug: "schneider", description: "Switchgear, Contactors & Breakers", active: true, order: 5 },
          { name: "ABB", slug: "abb", description: "Drives, Motors & Robotics", active: true, order: 6 },
        ];
        for (const b of defaultBrands) {
          try {
            await Brand.create(b);
          } catch {
            // ignore duplicate
          }
        }
      }
      const docs = await Brand.find({ active: { $ne: false } })
        .sort({ order: 1, name: 1 })
        .lean<IBrand[]>();
      return serialize(docs);
    }
  } catch {
    // fall through to store
  }
  const storedBrands = getStoredBrands();
  return serialize(storedBrands) as unknown as IBrand[];
}

export async function getBanners(): Promise<IBanner[]> {
  try {
    const db = await connectDB();
    if (db) {
      const docs = await Banner.find({ active: true })
        .sort({ order: 1 })
        .lean<IBanner[]>();
      if (docs.length) return serialize(docs);
    }
  } catch {
    // fall through to mock
  }
  return serialize(mockBanners);
}

export async function getServices(opts?: {
  featured?: boolean;
}): Promise<PopulatedService[]> {
  try {
    const db = await connectDB();
    if (db) {
      const count = await Service.countDocuments();
      if (count === 0) {
        for (const svc of mockServices) {
          try {
            await Service.create({
              title: svc.title,
              slug: svc.slug,
              shortDescription: svc.shortDescription,
              description: svc.description,
              image: svc.image,
              features: svc.features,
              order: svc.order,
              featured: svc.featured,
              published: true,
            });
          } catch {
            // ignore duplicate
          }
        }
      }
      const filter: Record<string, unknown> = { published: true };
      if (opts?.featured) filter.featured = true;
      const docs = await Service.find(filter)
        .populate("category")
        .populate({ path: "relatedProducts", populate: { path: "category" } })
        .sort({ order: 1, _id: 1 })
        .lean<PopulatedService[]>();
      return serialize(docs);
    }
  } catch {
    // fall through to mock
  }
  let res = getMockPopulatedServices();
  if (opts?.featured) res = res.filter((s) => s.featured);
  return serialize(res);
}

export async function getFeatures(): Promise<IFeature[]> {
  try {
    const db = await connectDB();
    if (db) {
      const count = await Feature.countDocuments();
      if (count === 0) {
        for (const feat of mockSpecialFeatures) {
          try {
            await Feature.create({
              name: feat.name,
              slug: feat.slug,
              order: feat.order,
              active: feat.active,
            });
          } catch {
            // ignore duplicate
          }
        }
      }
      const docs = await Feature.find({ active: { $ne: false } })
        .sort({ order: 1, _id: 1 })
        .lean<IFeature[]>();
      return serialize(docs);
    }
  } catch {
    // fall through to mock
  }
  return serialize(mockSpecialFeatures.filter((f) => f.active));
}

export async function getServiceBySlug(
  slug: string
): Promise<PopulatedService | null> {
  try {
    const db = await connectDB();
    if (db) {
      const doc = await Service.findOne({ slug, published: true })
        .populate("category")
        .populate({ path: "relatedProducts", populate: { path: "category" } })
        .lean<PopulatedService | null>();
      return doc ? serialize(doc) : null;
    }
  } catch {
    // fall through to mock
  }
  const s = getMockPopulatedServices().find((item) => item.slug === slug);
  return s ? serialize(s) : null;
}

export async function getProducts(opts?: {
  featured?: boolean;
  categorySlug?: string;
  subCategorySlug?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PopulatedProduct[]> {
  try {
    const db = await connectDB();
    if (db) {
      const count = await Product.countDocuments();
      if (count === 0) {
        // Seed mock products into DB if DB is empty
        for (const p of mockProducts) {
          try {
            const mockCat = mockCategories.find((c) => c._id === p.category);
            let catId = undefined;
            if (mockCat) {
              const dbCat = await Category.findOne({ slug: mockCat.slug });
              if (dbCat) catId = dbCat._id;
            }
            const mockSub = mockSubCategories.find((s) => s._id === p.subCategory);
            let subId = undefined;
            if (mockSub) {
              const dbSub = await SubCategory.findOne({ slug: mockSub.slug });
              if (dbSub) subId = dbSub._id;
            }
            await Product.create({
              name: p.name,
              slug: p.slug,
              sku: p.sku,
              brand: p.brand,
              category: catId,
              subCategory: subId,
              shortDescription: p.shortDescription,
              description: p.description,
              price: p.price,
              currency: p.currency || "BDT",
              image: p.image,
              gallery: p.gallery || [],
              videoUrl: p.videoUrl,
              specs: p.specs || [],
              specTable: p.specTable || [],
              atAGlance: p.atAGlance || [],
              includedItems: p.includedItems || [],
              beforeYouOrder: p.beforeYouOrder || [],
              condition: p.condition,
              packing: p.packing,
              warranty: p.warranty,
              warrantyAndReturns: p.warrantyAndReturns,
              availabilityText: p.availabilityText,
              inStock: p.inStock !== false,
              featured: Boolean(p.featured),
              published: true,
              order: p.order || 0,
            });
          } catch {
            // ignore duplicate
          }
        }
      }

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
      if (opts?.subCategorySlug) {
        const sub = await SubCategory.findOne({
          slug: opts.subCategorySlug,
        }).lean<ISubCategory | null>();
        if (sub) filter.subCategory = sub._id;
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
        .populate("subCategory")
        .populate("relatedServices")
        .sort({ order: 1, featured: -1, createdAt: -1 });
      if (opts?.page && opts?.limit) {
        query = query.skip((opts.page - 1) * opts.limit).limit(opts.limit);
      } else if (opts?.limit) {
        query = query.limit(opts.limit);
      }
      const docs = await query.lean<PopulatedProduct[]>();
      return serialize(docs);
    }
  } catch {
    // fall through to store
  }
  const stored = getStoredProducts(opts);
  return serialize(stored.items) as unknown as PopulatedProduct[];
}

export async function getProductsTotalCount(opts?: {
  featured?: boolean;
  categorySlug?: string;
  subCategorySlug?: string;
  q?: string;
}): Promise<number> {
  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = { published: true };
      if (opts?.featured) filter.featured = true;
      if (opts?.categorySlug) {
        const cat = await Category.findOne({
          slug: opts.categorySlug,
          type: "product",
        }).lean<ICategory | null>();
        if (cat) filter.category = cat._id;
        else return 0;
      }
      if (opts?.subCategorySlug) {
        const sub = await SubCategory.findOne({
          slug: opts.subCategorySlug,
        }).lean<ISubCategory | null>();
        if (sub) filter.subCategory = sub._id;
        else return 0;
      }
      if (opts?.q) {
        filter.$or = [
          { name: { $regex: opts.q, $options: "i" } },
          { shortDescription: { $regex: opts.q, $options: "i" } },
          { sku: { $regex: opts.q, $options: "i" } },
          { brand: { $regex: opts.q, $options: "i" } },
        ];
      }
      return await Product.countDocuments(filter);
    }
  } catch {
    // fall through
  }
  const stored = getStoredProducts(opts);
  return stored.total;
}

export async function getProductBySlug(
  slug: string
): Promise<PopulatedProduct | null> {
  try {
    const db = await connectDB();
    if (db) {
      const doc = await Product.findOne({ slug, published: true })
        .populate("category")
        .populate("subCategory")
        .populate("relatedServices")
        .lean<PopulatedProduct | null>();
      return doc ? serialize(doc) : null;
    }
  } catch {
    // fall through to store
  }
  const p = getStoredProductByIdOrSlug(slug);
  return p ? (serialize(p) as unknown as PopulatedProduct) : null;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<PopulatedProduct[]> {
  try {
    const db = await connectDB();
    if (db) {
      const primaryDocs = await Product.find({
        category: categoryId,
        slug: { $ne: excludeSlug },
        published: true,
      })
        .populate("category")
        .populate("subCategory")
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
        .populate("subCategory")
        .populate("relatedServices")
        .sort({ featured: -1, order: 1, _id: 1 })
        .limit(extraNeeded)
        .lean<PopulatedProduct[]>();

      return serialize([...(primaryDocs || []), ...(fallbackDocs || [])]);
    }
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

