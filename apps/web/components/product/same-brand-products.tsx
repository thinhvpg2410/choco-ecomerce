"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { ProductCard } from "@/components/product/product-card";

type Props = {
  brandId: string;
  excludeProductId: string;
};

export default function SameBrandProducts({
  brandId,
  excludeProductId,
}: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSameBrand = async () => {
      try {
        const res = await getProducts({ brand_id: brandId, limit: 8 });
        const filtered = (res.products || [])
          .filter((p: any) => p.id !== excludeProductId)
          .slice(0, 4);
        setProducts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSameBrand();
  }, [brandId, excludeProductId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-amber-400" />
          <div className="h-6 w-48 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[240px] rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-amber-400" />
        <h2 className="text-xl font-bold text-gray-800">Có thể bạn sẽ thích</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
