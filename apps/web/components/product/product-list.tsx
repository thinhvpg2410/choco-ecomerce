"use client";

import { ProductCard } from "./product-card";
import { Product } from "@/types/type";

interface Props {
  products: Product[];
}

export function ProductList({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy sản phẩm nào.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
