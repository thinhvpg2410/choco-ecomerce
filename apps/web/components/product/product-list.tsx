"use client";

import { ProductCard } from "./product-card";
import { Product } from "@/types/type";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";  // ← chỉnh lại đúng path store của bạn

interface Props {
  products: Product[];
}

export function ProductList({ products }: Props) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "grid";

  // Lấy danh sách items trong giỏ hàng
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Helper: lấy số lượng đã có trong giỏ theo product id
  const getCartQty = (productId: number | string) =>
    cartItems.find((item) => String(item.product_id) === String(productId))?.quantity ?? 0;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        Không tìm thấy sản phẩm nào.
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="bg-white border rounded-xl p-4 flex gap-4 items-start hover:shadow-sm transition"
          >
            <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              {product.brand?.name && (
                <p className="text-xs text-amber-700/70 uppercase tracking-widest font-semibold">
                  {product.brand.name}
                </p>
              )}
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {product.description}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  {product.sale_price ? (
                    <>
                      <span className="text-xl font-bold text-rose-600">
                        {product.sale_price.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-sm text-gray-400 line-through ml-2">
                        {product.price.toLocaleString("vi-VN")}đ
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-rose-600">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {product.stock === 0 ? (
                    <span className="text-red-500">Hết hàng</span>
                  ) : (
                    <span className="text-emerald-600">
                      {/* Hiển thị số còn có thể thêm, không phải tổng tồn kho */}
                      Còn {Math.max(0, product.stock - getCartQty(product.id))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          cartQty={getCartQty(product.id)}
        />
      ))}
    </div>
  );
}