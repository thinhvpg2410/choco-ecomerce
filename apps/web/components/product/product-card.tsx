"use client";

import { Product } from "@/types/type";
import { ShoppingCart, Check, Sparkles, Flame, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/services/cart.service";
import { toast } from "sonner";
import { fetchCart } from "@/store/cartSlice";
import { useDispatch } from "react-redux";

// ─────────────────────────────────────────────
// Shared interface for chat product cards
// ─────────────────────────────────────────────
export interface ChatProduct {
  id: string | number;
  name: string;
  price: number;
  sale_price?: number | null;
  image_url: string;
  stock: number;
  is_new?: boolean;
  brand?: { name: string } | null;
}

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
function calcDiscount(price: number, salePrice: number) {
  return Math.round(((price - salePrice) / price) * 100);
}

// ─────────────────────────────────────────────
// ProductCard  (vertical — grid / listing)
// ─────────────────────────────────────────────
interface CardProps {
  product: Product;
  cartQty?: number;
}

export function ProductCard({ product, cartQty = 0 }: CardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();

  const hasSale =
    product.sale_price != null && product.sale_price < product.price;

  const remainingStock = Math.max(0, product.stock - cartQty);
  const isOutOfStock = product.stock === 0 || remainingStock === 0;
  const isLowStock = remainingStock > 0 && remainingStock <= 5;

  const discountPercentage = hasSale
    ? calcDiscount(product.price, product.sale_price!)
    : 0;

  const changeQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    setQty((v) => Math.min(remainingStock || 1, Math.max(1, v + delta)));
  };

  const handleQtyInputChange = (raw: string) => {
    if (/^\d*$/.test(raw)) {
      const next = raw === "" ? 0 : Number(raw);
      setQty(Math.min(remainingStock || 1, next));
    }
  };

  const handleQtyInputBlur = () => {
    setQty((v) => Math.max(1, Math.min(remainingStock || 1, v || 1)));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding || isOutOfStock || !product?.id) return;

    const safeQty = Math.max(1, Math.min(remainingStock || 1, qty));
    setQty(safeQty);

    setIsAdding(true);
    try {
      await addToCart({ product_id: String(product.id), quantity: safeQty });
      dispatch(fetchCart() as any);
      setIsAdded(true);
      toast.success(`Đã thêm ${safeQty} sản phẩm vào giỏ!`);
      setTimeout(() => {
        setIsAdded(false);
        setQty(1);
      }, 1800);
    } catch (err: any) {
      if (err.response?.status === 401)
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      else if (err.response?.status === 400)
        toast.error(err.response.data?.message || "Dữ liệu không hợp lệ!");
      else if (err.response?.status === 409)
        toast.error("Số lượng vượt quá tồn kho!");
      else
        toast.error(
          err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
        );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div
        className="relative flex flex-col h-full rounded-3xl overflow-hidden
          bg-white border border-orange-100
          shadow-[0_2px_12px_rgba(0,0,0,0.06)]
          hover:shadow-[0_20px_50px_-8px_rgba(251,146,60,0.28)]
          transition-all duration-400 hover:-translate-y-1.5"
      >
        {/* ── IMAGE ── */}
        <div
          className="relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50"
          style={{ aspectRatio: "4/3.4" }}
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.07]"
          />

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-400" />

          {hasSale && (
            <span
              className="absolute top-3 left-3 z-10 flex items-center gap-1
              bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-red-200/60"
            >
              <Flame className="w-3 h-3" />-{discountPercentage}%
            </span>
          )}
          {product.is_new && !hasSale && (
            <span
              className="absolute top-3 left-3 z-10 flex items-center gap-1
              bg-amber-400 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-200/60"
            >
              <Sparkles className="w-3 h-3" />
              Mới
            </span>
          )}
          {isLowStock && (
            <span
              className="absolute top-3 right-3 z-10
              bg-white/90 border border-orange-300 text-orange-500
              text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm"
            >
              Sắp hết!
            </span>
          )}
        </div>

        {/* Candy stripe */}
        <div
          className="h-[3px] flex-shrink-0"
          style={{
            background:
              "repeating-linear-gradient(90deg,#FB923C 0,#FB923C 10px,#FDE68A 10px,#FDE68A 20px,#FDA4AF 20px,#FDA4AF 30px)",
          }}
        />

        {/* ── CARD BODY ── */}
        <div className="relative flex-1 flex flex-col px-4 pt-3.5 pb-5 gap-1">
          {product.brand?.name && (
            <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-orange-400">
              {product.brand.name}
            </p>
          )}

          <h3 className="text-[1.05rem] font-extrabold leading-snug text-gray-800 line-clamp-2 min-h-[2.6em]">
            {product.name}
          </h3>

          <div className="flex items-end gap-2 mt-1">
            {hasSale ? (
              <>
                <span className="text-xl font-black text-orange-500 leading-none">
                  {product.sale_price!.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-sm text-gray-300 line-through leading-none mb-px">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              </>
            ) : (
              <span className="text-xl font-black text-orange-500 leading-none">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-0.5">
            {isOutOfStock ? (
              <span className="text-red-400 font-bold">Hết hàng</span>
            ) : (
              <>
                Còn{" "}
                <span className="text-orange-500 font-black text-sm">
                  {remainingStock}
                </span>{" "}
                sản phẩm
              </>
            )}
          </p>

          {/* ── HOVER OVERLAY ── */}
          {!isOutOfStock && (
            <div
              className="absolute inset-0 z-20 flex flex-col justify-center gap-3 px-4
                bg-gradient-to-b from-white/95 to-orange-50/98 backdrop-blur-[2px]
                opacity-0 translate-y-3
                group-hover:opacity-100 group-hover:translate-y-0
                transition-all duration-300 ease-out"
            >
              {/* Stock pill */}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600
                  text-xs font-semibold px-3 py-1 rounded-full border border-orange-200"
                >
                  Còn{" "}
                  <span className="text-orange-500 font-black text-base leading-none">
                    {remainingStock}
                  </span>{" "}
                  sản phẩm
                </span>
              </div>

              {/* Qty row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                  Số lượng
                </span>
                <div className="flex items-center bg-white rounded-xl border-2 border-orange-200 overflow-hidden shadow-sm">
                  <button
                    onClick={(e) => changeQty(e, -1)}
                    disabled={qty <= 1}
                    className="w-8 h-8 flex items-center justify-center font-bold text-base
                      text-orange-500 hover:bg-orange-50 disabled:opacity-30 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={remainingStock || 1}
                    value={qty}
                    onChange={(e) => handleQtyInputChange(e.target.value)}
                    onBlur={handleQtyInputBlur}
                    onClick={(e) => e.preventDefault()}
                    className="w-10 h-8 text-center text-sm font-black text-gray-800
                      outline-none bg-transparent
                      [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={(e) => changeQty(e, 1)}
                    disabled={qty >= (remainingStock || 1)}
                    className="w-8 h-8 flex items-center justify-center font-bold text-base
                      text-orange-500 hover:bg-orange-50 disabled:opacity-30 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`relative w-full h-11 rounded-2xl text-sm font-black tracking-wide
                  overflow-hidden flex items-center justify-center gap-2 text-white
                  transition-all duration-300 active:scale-95 shadow-md
                  ${
                    isAdded
                      ? "bg-emerald-500 shadow-emerald-200"
                      : "bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 shadow-orange-200"
                  }`}
              >
                {!isAdded && (
                  <span
                    className="absolute inset-0 -skew-x-12 -translate-x-full
                    group-hover:translate-x-[200%] transition-transform duration-700
                    bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã thêm!
                    </>
                  ) : isAdding ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="3"
                          strokeDasharray="32"
                          strokeDashoffset="12"
                        />
                      </svg>
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Thêm vào giỏ
                    </>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// ProductCardHorizontal  (horizontal — chatbot)
// ─────────────────────────────────────────────
interface HorizontalProps {
  product: ChatProduct;
}

export function ProductCardHorizontal({ product }: HorizontalProps) {
  const hasSale =
    product.sale_price != null && product.sale_price < product.price;
  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const discountPct = hasSale
    ? calcDiscount(product.price, product.sale_price!)
    : 0;

  return (
    <div
      className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-orange-100
        bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)]
        hover:shadow-[0_6px_24px_-4px_rgba(251,146,60,0.22)]
        transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* ── IMAGE ── */}
      <div className="relative flex-shrink-0 w-[88px] bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          style={{ minHeight: 88 }}
        />
        {hasSale && (
          <span
            className="absolute top-1.5 left-1.5 flex items-center gap-0.5
              bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow"
          >
            <Flame className="w-2.5 h-2.5" />-{discountPct}%
          </span>
        )}
        {product.is_new && !hasSale && (
          <span
            className="absolute top-1.5 left-1.5 flex items-center gap-0.5
              bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow"
          >
            <Sparkles className="w-2.5 h-2.5" />
            Mới
          </span>
        )}
      </div>

      {/* Candy stripe — vertical */}
      <div
        className="w-[3px] flex-shrink-0 self-stretch"
        style={{
          background:
            "repeating-linear-gradient(180deg,#FB923C 0,#FB923C 8px,#FDE68A 8px,#FDE68A 16px,#FDA4AF 16px,#FDA4AF 24px)",
        }}
      />

      {/* ── INFO ── */}
      <div className="flex-1 flex flex-col justify-between px-3 py-2.5 min-w-0">
        <div>
          {product.brand?.name && (
            <p className="text-[9px] font-extrabold tracking-[0.18em] uppercase text-orange-400 mb-0.5">
              {product.brand.name}
            </p>
          )}
          <h4 className="text-[13px] font-extrabold leading-snug text-gray-800 line-clamp-2">
            {product.name}
          </h4>
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-end gap-1.5 min-w-0">
            {hasSale ? (
              <>
                <span className="text-[15px] font-black text-orange-500 leading-none whitespace-nowrap">
                  {product.sale_price!.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-[10px] text-gray-300 line-through leading-none mb-px whitespace-nowrap">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              </>
            ) : (
              <span className="text-[15px] font-black text-orange-500 leading-none whitespace-nowrap">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Stock badge */}
            {isOutOfStock ? (
              <span className="text-[9px] font-bold text-red-400 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                Hết hàng
              </span>
            ) : isLowStock ? (
              <span className="text-[9px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                Còn {product.stock}
              </span>
            ) : null}

            {/* View button */}
            <Link
              href={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black
                text-white whitespace-nowrap transition-all duration-200
                hover:opacity-90 active:scale-95 shadow-sm shadow-orange-200"
              style={{
                background: "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)",
              }}
            >
              <ExternalLink className="w-3 h-3" />
              Xem thêm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
