import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/lib/models";
import { getCategories, getSubCategories, getCached, setCached } from "@/lib/data";

export const dynamic = "force-dynamic";

interface CatalogTreeResponse {
  tree: Record<
    string,
    {
      _id: string;
      name: string;
      slug: string;
      subcategories: Array<{
        _id: string;
        name: string;
        slug: string;
        products: Array<{
          _id: string;
          name: string;
          slug: string;
          image: string;
        }>;
      }>;
    }
  >;
}

export async function GET() {
  try {
    const cachedTree = getCached<CatalogTreeResponse>("catalog_tree_data");
    if (cachedTree) {
      return NextResponse.json(cachedTree, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    await connectDB();

    const [categories, subcategories, rawProducts] = await Promise.all([
      getCategories("product"),
      getSubCategories(),
      Product.find({ published: { $ne: false } })
        .select("_id name slug image category subCategory order")
        .sort({ order: 1, _id: 1 })
        .lean<{
          _id: unknown;
          name: string;
          slug: string;
          image?: string;
          category?: unknown;
          subCategory?: unknown;
        }[]>(),
    ]);

    const tree: CatalogTreeResponse["tree"] = {};

    for (const cat of categories) {
      const catId = String(cat._id);
      const catSubs = subcategories.filter((s) => {
        const parentId =
          typeof s.category === "object" && s.category && "_id" in s.category
            ? String(s.category._id)
            : String(s.category);
        return parentId === catId;
      });

      tree[cat.slug] = {
        _id: catId,
        name: cat.name,
        slug: cat.slug,
        subcategories: catSubs.map((sub) => {
          const subId = String(sub._id);
          const subProds = rawProducts
            .filter((p) => {
              if (!p.subCategory) return false;
              const pSubId =
                typeof p.subCategory === "object" && p.subCategory && "_id" in p.subCategory
                  ? String(p.subCategory._id)
                  : String(p.subCategory);
              return pSubId === subId;
            })
            .slice(0, 6);

          return {
            _id: subId,
            name: sub.name,
            slug: sub.slug,
            products: subProds.map((p) => ({
              _id: String(p._id),
              name: p.name,
              slug: p.slug,
              image:
                p.image ||
                "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
            })),
          };
        }),
      };
    }

    const responsePayload = { tree };
    setCached("catalog_tree_data", responsePayload, 60_000);

    return NextResponse.json(responsePayload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load catalog tree" },
      { status: 500 }
    );
  }
}
