import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { BlogPost } from "@/lib/models";
import { mockBlogPosts } from "@/lib/mock-data";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    let post = null;

    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          post = await BlogPost.findById(id).populate("category").lean();
        }
        if (!post) {
          post = await BlogPost.findOne({ slug: id }).populate("category").lean();
        }
      }
    } catch (dbErr) {
      console.warn("Blog find DB warning:", dbErr);
    }

    if (!post) {
      post = mockBlogPosts.find((p) => String(p._id) === id || p.slug === id);
    }

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error("Get blog post error:", err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    let updated = null;

    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          updated = await BlogPost.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
          });
        }
        if (!updated) {
          updated = await BlogPost.findOneAndUpdate({ slug: id }, body, {
            new: true,
            runValidators: true,
          });
        }
      }
    } catch (dbErr) {
      console.warn("Blog update DB warning:", dbErr);
    }

    if (!updated) {
      updated = { ...body, _id: id };
    }

    await logActivity({
      action: "BLOG_UPDATE",
      entity: "BlogPost",
      entityId: String(updated._id || id),
      details: `Updated blog post "${updated.title || body.title || id}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/blog");
      if (updated.slug) revalidatePath(`/blog/${updated.slug}`);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (err) {
    console.error("Update blog post error:", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot delete" }, { status: 403 });
  }

  try {
    const { id } = await params;
    let post = null;

    try {
      const db = await connectDB();
      if (db) {
        if (mongoose.Types.ObjectId.isValid(id)) {
          post = await BlogPost.findByIdAndDelete(id);
        }
        if (!post) {
          post = await BlogPost.findOneAndDelete({ slug: id });
        }
      }
    } catch (dbErr) {
      console.warn("Blog delete DB warning:", dbErr);
    }

    await logActivity({
      action: "BLOG_DELETE",
      entity: "BlogPost",
      entityId: id,
      details: `Deleted blog post "${post?.title || id}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/blog");
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Delete blog post error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
