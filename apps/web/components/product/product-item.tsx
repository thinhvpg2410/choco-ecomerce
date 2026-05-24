"use client";

import { useState } from "react";
import { Product } from "@/types/type";
import { addToCart } from "@/services/cart.service";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Check, ShoppingCart, Zap, Minus, Plus, Flag } from "lucide-react";
import { useDispatch } from "react-redux";
import { fetchCart } from "@/store/cartSlice";

interface Props {
  product: Product;
}

export function ProductItem({ product }: Props) {
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [qty, setQty] = useState(1);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasSale =
    product.sale_price != null && product.sale_price < product.price;
  const discountPercentage = hasSale
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;
  const stock = product.stock || 1;

  const changeQty = (delta: number) => {
    setQty((v) => Math.min(stock, Math.max(1, v + delta)));
  };

  const handleQtyInputChange = (raw: string) => {
    if (/^\d*$/.test(raw)) {
      const next = raw === "" ? 1 : Number(raw);
      setQty(Math.min(stock, Math.max(1, next)));
    }
  };

  const handleQtyInputBlur = () => {
    setQty((v) => Math.max(1, Math.min(stock, v)));
  };

  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock || !product?.id) return;
    setIsAdding(true);
    try {
      await addToCart({ product_id: product.id, quantity: qty });
      dispatch(fetchCart() as any);
      toast.success(`Đã thêm ${qty} ${product.name} vào giỏ hàng!`);
      setIsAdded(true);
      setQty(1);
      setTimeout(() => setIsAdded(false), 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Thêm vào giỏ thất bại!");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAdding || isOutOfStock) return;
    const payload = {
      buy_now: true,
      product_id: product.id,
      quantity: qty,
      name: product.name,
      price: product.sale_price ?? product.price,
      image: product.image_url || "",
      cart_item_ids: [],
    };
    localStorage.setItem("checkout_cart", JSON.stringify(payload));
    window.location.href = "/checkout?mode=buy_now";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. BRAND + NAME + BADGES ── */}
      <div className="flex flex-col gap-2">
        {product.brand?.name && (
          <span className="text-xs font-semibold tracking-widest text-orange-500 uppercase">
            {product.brand.name}
          </span>
        )}

        <div className="flex items-start justify-between gap-3">
          <h1
            className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug"
            style={{ letterSpacing: "-0.02em" }}
          >
            {product.name}
          </h1>
          {hasSale && (
            <span className="shrink-0 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md mt-1">
              -{discountPercentage}%
            </span>
          )}
          {product.is_new && !hasSale && (
            <span className="shrink-0 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-md mt-1">
              Mới
            </span>
          )}
        </div>
      </div>

      {/* ── 2. RATING ── */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-800">
            {product.average_rating?.toFixed(1) || "0.0"}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(product.average_rating || 0) ? "text-orange-400 fill-orange-400" : "text-gray-200 fill-gray-200"}`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">
          <span className="font-semibold text-gray-700">
            {product.review_count || 0}
          </span>{" "}
          đánh giá
        </span>
        <span className="text-gray-300">|</span>
        <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-xs">
          <Flag className="w-3 h-3" />
          Báo cáo
        </button>
      </div>

      {/* ── 3. PRICE ── */}
      <div
        className="flex items-baseline gap-3 px-4 py-4 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #fffbf5 100%)",
          border: "1px solid #fed7aa",
        }}
      >
        <span
          className="text-3xl font-black text-orange-600"
          style={{ letterSpacing: "-0.03em" }}
        >
          {(product.sale_price ?? product.price).toLocaleString()}đ
        </span>
        {hasSale && (
          <span className="text-base text-gray-400 line-through font-medium">
            {product.price.toLocaleString()}đ
          </span>
        )}
        {hasSale && (
          <span className="ml-auto text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            Tiết kiệm {(product.price - product.sale_price!).toLocaleString()}đ
          </span>
        )}
      </div>

      {/* ── 4. PRODUCT DETAILS ── */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Chi tiết sản phẩm
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            product.category?.name && ["Danh mục", product.category.name],
            product.stock !== undefined && [
              "Tồn kho",
              <span
                className={`font-semibold ${isOutOfStock ? "text-red-500" : isLowStock ? "text-orange-500" : "text-emerald-600"}`}
              >
                {isOutOfStock
                  ? "Hết hàng"
                  : isLowStock
                    ? `Còn ${product.stock} (sắp hết)`
                    : `${product.stock} sản phẩm`}
              </span>,
            ],
            product.package_type && ["Loại bao bì", product.package_type],
            product.brand?.name && ["Thương hiệu", product.brand.name],
            product.origin && ["Xuất xứ", product.origin],
            product.weight &&
              product.weight_unit && [
                "Trọng lượng",
                `${product.weight} ${product.weight_unit}`,
              ],
            product.ingredients && ["Thành phần", product.ingredients],
            product.description && ["Mô tả", product.description],
          ]
            .filter(Boolean)
            .map(([label, value], idx) => (
              <div
                key={idx}
                className="grid grid-cols-[140px_1fr] px-4 py-2.5 text-sm hover:bg-gray-50/80 transition-colors"
              >
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}

          {product.nutrition_info && (
            <div className="grid grid-cols-[140px_1fr] px-4 py-2.5 text-sm">
              <span className="text-gray-500 font-medium">Dinh dưỡng</span>
              <div className="text-gray-800 space-y-0.5">
                {Object.entries(product.nutrition_info).map(([key, val]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {val as string}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 5. QUANTITY ── */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide min-w-[72px]">
          Số lượng
        </span>
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => changeQty(-1)}
            disabled={qty <= 1}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min={1}
            max={stock}
            value={qty}
            onChange={(e) => handleQtyInputChange(e.target.value)}
            onBlur={handleQtyInputBlur}
            className="w-14 h-9 text-center border-x border-gray-200 bg-white text-sm font-bold text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => changeQty(1)}
            disabled={qty >= stock}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {isLowStock && (
          <span className="text-xs text-orange-500 font-medium">
            Còn {product.stock} sản phẩm
          </span>
        )}
      </div>

      {/* ── 6. ACTION BUTTONS ── */}
      <div className="flex gap-3">
        {/* ADD TO CART */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          className={`
            flex-1 flex items-center justify-center gap-2
            h-12 px-5 rounded-xl text-sm font-semibold
            border-2 transition-all duration-200
            disabled:cursor-not-allowed
            ${
              isAdded
                ? "bg-emerald-500 border-emerald-500 text-white"
                : isOutOfStock
                  ? "bg-gray-100 border-gray-200 text-gray-400"
                  : "bg-white border-orange-500 text-orange-600 hover:bg-orange-50 active:scale-[0.98]"
            }
          `}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 shrink-0" />
              <span>Đã thêm vào giỏ!</span>
            </>
          ) : isAdding ? (
            <>
              <svg
                className="w-4 h-4 animate-spin shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span>Đang thêm...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>{isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}</span>
            </>
          )}
        </button>

        {/* BUY NOW */}
        <button
          onClick={handleBuyNow}
          disabled={isAdding || isOutOfStock}
          className={`
            flex-1 flex items-center justify-center gap-2
            h-12 px-5 rounded-xl text-sm font-semibold text-white
            transition-all duration-200
            disabled:cursor-not-allowed
            ${
              isOutOfStock
                ? "bg-gray-300"
                : "bg-orange-500 hover:bg-orange-600 active:scale-[0.98] shadow-md shadow-orange-200"
            }
          `}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>{isOutOfStock ? "Hết hàng" : "Mua ngay"}</span>
        </button>
      </div>
    </div>
  );
}
