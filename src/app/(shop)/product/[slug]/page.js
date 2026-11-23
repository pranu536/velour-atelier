import { notFound } from "next/navigation";
import { INITIAL_PRODUCTS } from "@/lib/seed-data";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : "";

  const product = INITIAL_PRODUCTS.find(
    (p) =>
      p.slug === decodedSlug ||
      p.id === decodedSlug ||
      p.slug === rawSlug ||
      p.id === rawSlug
  );

  if (!product) {
    return {
      title: "Garment Not Found | Velour",
    };
  }

  return {
    title: `${product.name} | Velour`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }) {
  // Await params promise (Next.js 15+ and 16+)
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : "";

  // Locate product from catalog by slug or id
  const product = INITIAL_PRODUCTS.find(
    (p) =>
      p.slug === decodedSlug ||
      p.id === decodedSlug ||
      p.slug === rawSlug ||
      p.id === rawSlug
  );

  // Handle invalid product IDs/slugs with proper Not Found page
  if (!product) {
    notFound();
  }

  // Recommendations: Other products from same gender first, then unisex/category
  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) =>
      p.slug !== product.slug &&
      (p.gender === product.gender ||
        (product.gender !== "Kids" && p.gender === "Unisex") ||
        p.categorySlug === product.categorySlug)
  ).slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
