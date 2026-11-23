import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [], emptyMessage = "No garments found matching criteria." }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-brand-50/50 rounded-sm border border-neutral-100 p-8 my-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-noir-900">
          No collections found
        </h3>
        <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
      {products.map((product) => (
        <ProductCard key={product.id || product.slug} product={product} />
      ))}
    </div>
  );
}
