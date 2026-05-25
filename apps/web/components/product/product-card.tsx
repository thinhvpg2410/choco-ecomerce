"use client";

import { Product } from "@/types/type";
import { ShoppingCart, Check, Sparkles, Flame } from "lucide-react";
import Link from "next/link";
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

  const handleQtyInputChange = (raw: string) => {
    if (/^\d*$/.test(raw)) {
      const next = raw === "" ? 0 : Number(raw);
      setQty(Math.min(product.stock || 1, next));
    }
  };

  const handleQtyInputBlur = () => {
    const stock = product.stock || 1;
    setQty((v) => Math.max(1, Math.min(stock, v || 1)));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding || isOutOfStock || !product?.id) return;

    const safeQty = Math.max(1, Math.min(product.stock || 1, qty));
    setQty(safeQty);

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
      if (err.response?.status === 401)
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      else if (err.response?.status === 400)
        toast.error(err.response.data?.message || "Dữ liệu không hợp lệ!");
      else if (err.response?.status === 404)
        toast.error("Sản phẩm không tồn tại!");
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
      {/*
        CARD — position:relative so the hover overlay (absolute, bottom-0)
        can slide up over the name+price section which lives in the bottom portion.
      */}
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

          {/* Subtle dim on whole card hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-400" />

          {/* Badges */}
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

        {/* ── CARD BODY (name + price + stock) — this is what the overlay covers ── */}
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
                  {product.stock}
                </span>{" "}
                sản phẩm
              </>
            )}
          </p>

          {/* ── HOVER OVERLAY — absolute, covers entire card body (name+price area) ── */}
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
                    {product.stock}
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
                    max={product.stock || 1}
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
                    disabled={qty >= (product.stock || 1)}
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
