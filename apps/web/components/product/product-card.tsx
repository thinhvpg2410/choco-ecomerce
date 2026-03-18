"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/type";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const hasSale =
    product.sale_price != null && product.sale_price < product.price;
  const discountPercentage = hasSale
    ? Math.round(100 - (product.sale_price! / product.price) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="block">
      <Card
        className="
    group relative w-full bg-white border border-gray-200/50 
    rounded-2xl shadow-sm hover:shadow-2xl hover:border-orange-300/50 
    transition-all duration-300 flex flex-col
  "
      >
        {/* BADGE GIẢM GIÁ */}
        <div className="h-12 px-4 pt-3 absolute top-0 left-0 z-10">
          {hasSale && (
            <div
              className={`
              bg-gradient-to-r from-red-500 to-pink-500 
              text-white text-sm font-bold px-3 py-1 rounded-full 
              shadow-md transform -rotate-2 hover:rotate-0 transition-transform
            `}
            >
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* IMAGE */}
        <div className="relative px-4 pt-10 pb-2 flex-grow bg-gradient-to-b from-pink-50/30 to-white">
          <div className="overflow-hidden rounded-xl">
            <img
              src={product.image_url}
              alt={product.name}
              className={`
              w-full aspect-square object-cover rounded-xl 
              transition-all duration-500 group-hover:scale-110 group-hover:rotate-1
            `}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </div>

        <CardHeader className="px-5 pt-1 pb-2 space-y-1.5 text-left">
          <CardTitle
            className={`
    text-base md:text-xl font-semibold line-clamp-2 
    text-gray-800 group-hover:text-orange-600 transition-colors
  `}
          >
            {product.name}
          </CardTitle>

          {/* PRICE - giảm kích thước */}
          <div className="flex items-baseline justify-center md:justify-start gap-2.5">
            {hasSale ? (
              <>
                <span className="text-lg md:text-xl font-bold text-red-600 tracking-tight">
                  {product.sale_price!.toLocaleString()}đ
                </span>
                <span className="text-xs md:text-sm text-gray-400 line-through opacity-80">
                  {product.price.toLocaleString()}đ
                </span>
              </>
            ) : (
              <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
                {product.price.toLocaleString()}đ
              </span>
            )}
          </div>
        </CardHeader>

        {/* BUTTON */}
        <div className="px-5 pb-4 mt-auto">
          <Button
            className={`
            w-full py-5 text-base font-semibold rounded-xl 
            bg-gradient-to-r from-orange-500 to-pink-500 
            hover:from-orange-600 hover:to-pink-600 
            transition-all duration-300 shadow-md hover:shadow-lg
            flex items-center justify-center gap-2
          `}
          >
            <ShoppingCart className="h-5 w-5" />
            Thêm vào giỏ
          </Button>
        </div>
      </Card>
    </Link>
  );
}
