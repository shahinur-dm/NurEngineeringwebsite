import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { BlogPost } from "@/lib/models";
import { BlogForm } from "../../BlogForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const post = await BlogPost.findById(id).lean();
  if (!post) notFound();

  const serialized = JSON.parse(JSON.stringify(post));

  return <BlogForm initialData={serialized} isEdit />;
}
