"use client";

import { Product } from "@/types/type";
import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { addToCart } from "@/services/cart.service";
import { toast } from "sonner"; // sửa lỗi typo "sooner" → "sonner"

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const hasSale =
    product.sale_price != null && product.sale_price < product.price;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOkStock = product.stock > 5;

  const discountPercentage = hasSale
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const changeQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    setQty((v) => Math.min(product.stock, Math.max(1, v + delta)));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding || isOutOfStock) return;
    setIsAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: qty });
      setIsAdded(true);
      toast.success(`Đã thêm ${qty} sản phẩm vào giỏ!`);
      setTimeout(() => {
        setIsAdded(false);
        setQty(1);
      }, 1800);
    } catch {
      toast.error("Thêm vào giỏ thất bại, thử lại nhé!");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-[#ebebeb] hover:shadow-[0_20px_48px_rgba(0,0,0,0.10)] transition-all duration-300 flex flex-col h-full">
        {/* ẢNH */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          {/* overlay mờ dưới ảnh */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/[0.08] to-transparent pointer-events-none" />

          {hasSale && (
            <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}
          {product.is_new && !hasSale && (
            <span className="absolute top-2.5 right-2.5 bg-violet-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              Mới
            </span>
          )}
        </div>

        {/* NỘI DUNG */}
        <div className="p-3.5 flex flex-col gap-1 flex-1">
          {/* Brand */}
          {product.brand?.name && (
            <p className="text-[10.5px] text-[#b0aaa0] uppercase tracking-[.06em] font-semibold">
              {product.brand.name}
            </p>
          )}
          {/* Tên 2 dòng rồi ... */}
          <h3 className="text-2xl h-16 font-semibold text-[#3b1d14] line-clamp-2 group-hover:text-[#a67c2d] transition-colors">
            {product.name}
          </h3>

          {/* Giá */}
          <div className="flex items-baseline gap-0.5">
            {hasSale ? (
              <>
                <span className="text-xl font-extrabold text-rose-600">
                  {product.sale_price!.toLocaleString("vi-VN")}đ
                </span>
                {/* <span className="text-[11.5px] text-[#d1ccc4] line-through">
                  {product.price.toLocaleString("vi-VN")}đ
                </span> */}
              </>
            ) : (
              <span className="text-xl font-extrabold text-rose-600">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          {/* Tồn kho */}
          {isOkStock && (
            <p className="text-base font-extrabold text-[#8D6E63]">
              Còn {product.stock} sản phẩm
            </p>
          )}
          {isLowStock && (
            <p className="text-base font-extrabold text-amber-500">
              Còn {product.stock} sản phẩm
            </p>
          )}
          {isOutOfStock && (
            <p className="text-base font-extrabold text-red-500">Hết hàng</p>
          )}

          {/* Divider */}
          <div className="h-px bg-[#f3f0eb] my-0.5" />

          {/* Quantity picker */}
          <div
            className={`flex items-center justify-between ${isOutOfStock ? "opacity-35 pointer-events-none" : ""}`}
          >
            <span className="text-sm text-[#6b4f3b]">
              Số lượng
            </span>
            <div className="flex items-center border-[1.5px] border-[#f0ede8] rounded-[10px] overflow-hidden bg-[#fafafa]">
              <button
                onClick={(e) => changeQty(e, -1)}
                disabled={qty <= 1}
                className="w-[30px] h-[28px] flex items-center justify-center text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                −
              </button>
              <span className="min-w-[28px] text-center text-[13px] font-bold text-[#1a1a1a]">
                {qty}
              </span>
              <button
                onClick={(e) => changeQty(e, 1)}
                disabled={qty >= product.stock}
                className="w-[30px] h-[28px] flex items-center justify-center text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút thêm giỏ */}
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`mt-2 w-full rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300
              ${
                isAdded
                  ? "bg-emerald-500 hover:bg-emerald-500"
                  : isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                    : "bg-gradient-to-br from-orange-500 to-pink-500 hover:opacity-90 active:scale-[.98]"
              } text-white`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" /> Đã thêm {qty} vào giỏ!
              </>
            ) : isAdding ? (
              "Đang thêm..."
            ) : isOutOfStock ? (
              <>
                <ShoppingCart className="w-4 h-4" /> Hết hàng
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
