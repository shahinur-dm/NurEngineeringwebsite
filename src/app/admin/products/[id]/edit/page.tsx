import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models";
import { ProductForm } from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).lean();
  if (!product) notFound();

  const serialized = JSON.parse(JSON.stringify(product));

  return <ProductForm initialData={serialized} isEdit />;
}
