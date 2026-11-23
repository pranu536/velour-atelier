import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : "";

  if (!decodedSlug) {
    return {
      title: "Garment Not Found | Velour",
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug: decodedSlug },
    });

    if (!product) {
      return {
        title: "Garment Not Found | Velour",
      };
    }

    return {
      title: `${product.name} | Velour`,
      description: product.description,
    };
  } catch (err) {
    return {
      title: "Velour Atelier",
    };
  }
}

export default async function ProductDetailPage({ params }) {
  // Await params promise (Next.js 15+ and 16+)
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : "";

  if (!decodedSlug) {
    notFound();
  }

  let product = null;
  let relatedProducts = [];

  try {
    // Locate product from live MongoDB Atlas via unique slug
    product = await prisma.product.findUnique({
      where: { slug: decodedSlug },
      include: { category: true },
    });

    if (product) {
      // Recommendations: Other products from same gender or unisex, or same category
      relatedProducts = await prisma.product.findMany({
        where: {
          slug: { not: product.slug },
          OR: [
            { gender: product.gender },
            ...(product.gender !== "Kids" ? [{ gender: "Unisex" }] : []),
            { categoryId: product.categoryId },
          ],
        },
        include: { category: true },
        take: 4,
      });
    }
  } catch (error) {
    console.error("ProductDetailPage database fetch error:", error);
  }

  // Handle invalid product IDs/slugs with proper Not Found page
  if (!product) {
    notFound();
  }

  // Serialize MongoDB ObjectIds and Dates for Client Component
  const serializedProduct = {
    ...product,
    createdAt: product.createdAt?.toISOString?.() || null,
    updatedAt: product.updatedAt?.toISOString?.() || null,
    category: product.category
      ? {
          ...product.category,
          createdAt: product.category.createdAt?.toISOString?.() || null,
        }
      : null,
  };

  const serializedRelated = relatedProducts.map((p) => ({
    ...p,
    createdAt: p.createdAt?.toISOString?.() || null,
    updatedAt: p.updatedAt?.toISOString?.() || null,
    category: p.category
      ? {
          ...p.category,
          createdAt: p.category.createdAt?.toISOString?.() || null,
        }
      : null,
  }));

  return (
    <ProductDetailClient
      product={serializedProduct}
      relatedProducts={serializedRelated}
    />
  );
}
