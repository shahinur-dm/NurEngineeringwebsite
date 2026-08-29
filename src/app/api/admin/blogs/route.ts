import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BlogPost } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";
import { mockBlogPosts, mockBlogCategories } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");

  try {
    const db = await connectDB();
    if (db) {
      const filter: Record<string, unknown> = {};

      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { summary: { $regex: q, $options: "i" } },
        ];
      }
      if (category) filter.category = category;
      if (status) filter.status = status;

      const posts = await BlogPost.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ posts });
    }
  } catch (err) {
    console.warn("Get blog posts DB error, using fallback posts:", err);
  }

  // Fallback
  const catMap = new Map(mockBlogCategories.map((c) => [String(c._id), c]));
  let list = mockBlogPosts.map((p) => ({
    ...p,
    category: catMap.get(String(p.category)) || { name: "Automation", slug: "automation" },
  }));

  if (q) {
    const lq = q.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(lq) || p.summary.toLowerCase().includes(lq));
  }

  return NextResponse.json({ posts: list });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot create" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.summary || !body.content) {
      return NextResponse.json(
        { error: "Title, Summary and Content are required" },
        { status: 400 }
      );
    }

    await connectDB();
    let slug = (body.slug || body.title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-");

    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const post = await BlogPost.create({
      ...body,
      slug,
      author: body.author || admin.name,
      tags: body.tags || [],
    });

    await logActivity({
      action: "BLOG_CREATE",
      entity: "BlogPost",
      entityId: String(post._id),
      details: `Created blog post "${post.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (err) {
    console.error("Create blog post error:", err);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
