// app/product/[id]/page.tsx   (hoặc app/products/[id]/page.tsx tùy route bạn đang dùng)

import { notFound } from "next/navigation";
import api from "@/services/axios";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  description?: string;
  package_type?: string;
  weight?: string[];
  weight_unit?: string;
  category_id?: string;
  brand_id?: string;
  // thêm các field khác nếu backend trả về
}

interface Props {
  params: Promise<{ id: string }>;
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
                  className="w-full h-full object-contain transition-all duration-700 hover:scale-110"
                />
              </div>

              {/* Wishlist button */}
              <button className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-md hover:bg-pink-50 transition">
                <Heart className="w-5 h-5 text-gray-600 hover:text-pink-500" />
              </button>
            </div>
          </div>

          {/* RIGHT - PRODUCT INFO */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                {product.name}
              </h1>
              <p className="text-pink-600 mt-2 font-medium">
                {/* {brand?.name} • {category?.name} */}{" "}
                {/* Sau này thêm brand & category nếu cần */}
              </p>
            </div>

            {/* PRICE */}
            <div className="flex items-baseline gap-4">
              {hasSale ? (
                <>
                  <span className="text-4xl font-bold text-red-600 tracking-tighter">
                    {product.sale_price!.toLocaleString()}đ
                  </span>
                  <span className="text-2xl text-gray-400 line-through">
                    {product.price.toLocaleString()}đ
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-gray-900 tracking-tighter">
                  {product.price.toLocaleString()}đ
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <p className="font-semibold text-gray-800 mb-3">Mô tả sản phẩm</p>
              <div className="bg-white border rounded-2xl p-6 text-gray-700 leading-relaxed shadow-sm">
                {product.description || "Đang cập nhật mô tả chi tiết..."}
              </div>
            </div>

            {/* PACKAGE TYPE */}
            {product.package_type && (
              <div>
                <p className="font-semibold mb-2 text-gray-800">
                  Loại sản phẩm
                </p>
                <div className="inline-flex items-center border border-red-400 text-red-500 px-6 py-3 rounded-2xl relative text-base font-medium bg-red-50">
                  <Check className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-5 h-5 p-1" />
                  {product.package_type}
                </div>
              </div>
            )}

            {/* WEIGHT VARIANTS */}
            {product.weight && product.weight.length > 0 && (
              <div>
                <p className="font-semibold mb-3 text-gray-800">Trọng lượng</p>
                <div className="flex flex-wrap gap-3">
                  {product.weight.map((w, index) => (
                    <div
                      key={index}
                      className={`px-6 py-3 rounded-2xl border text-sm font-medium cursor-pointer transition-all
                        ${
                          index === 0
                            ? "border-pink-500 text-pink-600 bg-pink-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {w}
                      {product.weight_unit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADD TO CART BUTTON */}
            <Button
              size="lg"
              className="mt-4 w-full md:w-fit px-10 py-7 text-lg font-semibold rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              Thêm vào giỏ hàng
            </Button>

            <p className="text-xs text-gray-500 text-center md:text-left">
              ✓ Miễn phí vận chuyển cho đơn từ 500.000đ
              <br />✓ Đổi trả trong 7 ngày
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
