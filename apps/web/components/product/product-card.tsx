"use client";

import { Product } from "@/types/type";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [isAdding, setIsAdding] = useState(false);

  const hasSale =
    product.sale_price != null && product.sale_price < product.price;

  const discountPercentage = hasSale
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 700);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
        {/* IMAGE */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-8 transition duration-500 group-hover:scale-110"
          />

          {/* badge */}
          {hasSale && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* NAME (to hơn, 1 dòng + ...) */}
          <h3 className="text-xl font-semibold text-gray-900 truncate group-hover:text-pink-600 transition">
            {product.name}
          </h3>

          {/* PRICE (nhỏ hơn name) */}
          <div className="flex items-center gap-2">
            {hasSale ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  {product.sale_price!.toLocaleString()}đ
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {product.price.toLocaleString()}đ
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {product.price.toLocaleString()}đ
              </span>
            )}
          </div>

          {/* BUTTON (gần hơn) */}
          <div className="mt-1 overflow-hidden">
            <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  "Đang thêm..."
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
