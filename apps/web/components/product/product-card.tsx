"use client";

import { Product } from "@/types/type";
import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { addToCart } from "@/services/cart.service";
import { toast } from "sonner";
import { fetchCart } from "@/store/cartSlice";
import { useDispatch } from "react-redux";
interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [qty, setQty] = useState(1);
const dispatch = useDispatch();
  const hasSale =
    product.sale_price != null && product.sale_price < product.price;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const discountPercentage = hasSale
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const changeQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    setQty((v) => Math.min(product.stock || 1, Math.max(1, v + delta)));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding || isOutOfStock || !product?.id) return;

    setIsAdding(true);
    try {
      await addToCart({ product_id: String(product.id), quantity: qty });
      dispatch(fetchCart() as any);
      
      setIsAdded(true);
      toast.success(`Đã thêm ${qty} sản phẩm vào giỏ!`);

      setTimeout(() => {
        setIsAdded(false);
        setQty(1);
      }, 1800);
    } catch (err: any) {
      console.error("Add to cart error:", err);

      if (err.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      } else if (err.response?.status === 400) {
        toast.error(err.response.data?.message || "Dữ liệu không hợp lệ!");
      } else if (err.response?.status === 404) {
        toast.error("Sản phẩm không tồn tại!");
      } else if (err.response?.status === 409) {
        toast.error("Số lượng vượt quá tồn kho!");
      } else {
        toast.error(
          err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
        );
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative">
        {/* Ảnh + Overlay */}
        <div className="relative aspect-[4/3.8] overflow-hidden bg-gray-50 flex-shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          {hasSale && (
            <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow z-10">
              -{discountPercentage}%
            </span>
          )}
          {product.is_new && !hasSale && (
            <span className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-2xl z-10">
              Mới
            </span>
          )}

          {/* Overlay: Quantity + Add to Cart */}
          <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
            {/* Quantity */}
            <div
              className={`flex items-center justify-between mb-4 ${isOutOfStock ? "opacity-40 pointer-events-none" : ""}`}
            >
              <span className="text-white text-sm font-medium">Số lượng</span>
              <div className="flex items-center bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl overflow-hidden">
                <button
                  onClick={(e) => changeQty(e, -1)}
                  disabled={qty <= 1}
                  className="w-9 h-8 flex items-center justify-center text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold text-gray-800">
                  {qty}
                </span>
                <button
                  onClick={(e) => changeQty(e, 1)}
                  disabled={qty >= (product.stock || 1)}
                  className="w-9 h-8 flex items-center justify-center text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nút Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={`w-full h-12 rounded-2xl text-sm font-bold tracking-wider overflow-hidden relative group/btn
                ${
                  isAdded
                    ? "bg-emerald-600"
                    : isOutOfStock
                      ? "bg-gray-400 text-white"
                      : "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700"
                } text-white transition-all duration-300`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Đã thêm!
                  </>
                ) : isAdding ? (
                  "Đang thêm..."
                ) : isOutOfStock ? (
                  "Hết hàng"
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                  </>
                )}
              </span>

              {!isAdded && !isOutOfStock && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[200%] transition-transform duration-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-5 flex-1 flex flex-col">
          {product.brand?.name && (
            <p className="text-xs text-amber-700/70 uppercase tracking-widest font-semibold">
              {product.brand.name}
            </p>
          )}

          {/* 🔥 Phần tên sản phẩm - ĐÃ FIX */}
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-2 min-h-[3.2em] mt-2 mb-3 group-hover:text-amber-800 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              {hasSale ? (
                <>
                  <span className="text-2xl font-bold text-rose-600">
                    {product.sale_price!.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {product.price.toLocaleString("vi-VN")}đ
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-rose-600">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>

            {/* Stock */}
            {isOutOfStock ? (
              <p className="text-red-500 text-sm mt-1">Hết hàng</p>
            ) : isLowStock ? (
              <p className="text-amber-600 text-sm mt-1">
                Chỉ còn {product.stock} sản phẩm
              </p>
            ) : (
              <p className="text-emerald-600 text-sm mt-1">
                Còn {product.stock} sản phẩm
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

