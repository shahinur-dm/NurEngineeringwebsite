import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BlogPost } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await connectDB();
    const post = await BlogPost.findById(id).populate("category").lean();
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
    await connectDB();

    const updated = await BlogPost.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    await logActivity({
      action: "BLOG_UPDATE",
      entity: "BlogPost",
      entityId: String(updated._id),
      details: `Updated blog post "${updated.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

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
    await connectDB();
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    await logActivity({
      action: "BLOG_DELETE",
      entity: "BlogPost",
      entityId: id,
      details: `Deleted blog post "${post.title}"`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Delete blog post error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
