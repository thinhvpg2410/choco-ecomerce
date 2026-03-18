"use client";
import { Product } from "@/types/type";
import { ProductCard } from "./product-card";

interface Props {
  products: Product[];
}

export function ProductList({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No products found</div>
    );
  }

  return (
    <div
      className="grid gap-5 
      grid-cols-4
      sm:grid-cols-3 
      md:grid-cols-4 
      lg:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
