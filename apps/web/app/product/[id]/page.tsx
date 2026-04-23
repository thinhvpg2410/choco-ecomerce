// app/product/[id]/page.tsx   (hoặc app/products/[id]/page.tsx tùy route bạn đang dùng)

import { notFound } from "next/navigation";
import api from "@/services/axios";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Heart } from "lucide-react";
import { ProductItem } from "@/components/product/product-item";
import { Product } from "@/types/type";
import { is } from "zod/v4/locales";
import ReviewList from "@/components/review/review-list";
interface Props {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let product: Product;
  try {
    const res = await api.get(`/products/${id}`);
    product = res.data.data || res.data.product;

    if (!product) return notFound();
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);
    return notFound();
  }

  const hasSale =
    product.sale_price != null && product.sale_price < product.price;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* LEFT - IMAGE SECTION */}
          <div className="relative">
            <div className="sticky top-24 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <div className="aspect-square bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-8">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain transition-all duration-700 hover:scale-110 rounded-2xl hover:rounded-3xl"
                />
              </div>
            </div>
          </div>

          {/* RIGHT - PRODUCT INFO */}
            <ProductItem product={product as any} />
        </div>
        <div className="mt-16 mx-auto">
          <h2 className="text-2xl font-bold text-[#3b1d14] mb-6">
            Đánh giá sản phẩm
          </h2>
          <ReviewList productId={id} />
        </div>
      </div>
    </div>
  );
}
