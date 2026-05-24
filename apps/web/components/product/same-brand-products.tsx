"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { ProductCard } from "@/components/product/product-card";
import { Sparkles } from "lucide-react";

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
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-[3px] h-6 rounded-full bg-orange-400" />
          <div className="h-4 w-44 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div
                className="h-44 rounded-xl animate-pulse bg-gray-100"
                style={{ animationDelay: `${i * 70}ms` }}
              />
              <div
                className="h-3 w-4/5 rounded animate-pulse bg-gray-100"
                style={{ animationDelay: `${i * 70 + 40}ms` }}
              />
              <div
                className="h-3 w-2/5 rounded animate-pulse bg-gray-100"
                style={{ animationDelay: `${i * 70 + 80}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[3px] h-6 rounded-full bg-orange-500" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Có thể bạn sẽ thích
            <Sparkles className="w-3.5 h-3.5 text-orange-400 fill-orange-200" />
          </h2>
        </div>
        <span className="text-xs text-gray-400">
          {products.length} sản phẩm
        </span>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-xl"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
