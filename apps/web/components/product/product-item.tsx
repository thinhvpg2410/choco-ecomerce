"use client";

import { useState } from "react";
import { Product } from "@/types/type";
import { addToCart } from "@/services/cart.service";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Check, ShoppingCart } from "lucide-react";

interface Props {
    product: Product;
}

export function ProductItem({ product }: Props) {
    const [isAdded, setIsAdded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [qty, setQty] = useState(1);

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOkStock = product.stock > 5;
    const hasSale =
    product.sale_price != null && product.sale_price < product.price;
    const discountPercentage = hasSale
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

    const changeQty = (delta: number) => {
    setQty((v) => Math.min(product.stock, Math.max(1, v + delta)));
    };

    const handleAddToCart = async () => {
    if (isAdding || isOutOfStock) return;
    setIsAdding(true);
    try {
    await addToCart({
        product_id: product.id,
        quantity: qty,
    });

    toast.success(`Đã thêm ${qty} sản phẩm vào giỏ!`);
    setQty(1);
    } catch {
    toast.error("Thêm vào giỏ thất bại!");
    } finally {
    setIsAdding(false);
    }
    };

    
    const handleBuyNow = async () => {
        await addToCart({ product_id: product.id, quantity: qty });
        // Chuyển hướng đến trang thanh toán
        window.location.href = "/checkout";
    };

    return (
    <div className="bg-white border rounded-2xl p-5 text-gray-700 leading-relaxed shadow-sm">
        <div className="flex flex-col gap-3">
            {/* 1. PRODUCT NAME */}
            <div className="flex items-start justify-between gap-3">
                
                {/* NAME */}
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-[#3b1d14]">
                    {product.name}
                </h1>

                {/* BADGES */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    {hasSale && (
                    <span className="bg-[#a67c2d] text-white text-sm font-bold px-2.5 py-1 rounded-sm">
                        - {discountPercentage}%
                    </span>
                    )}

                    {product.is_new && !hasSale && (
                    <span className="bg-red-600 text-white text-sm font-bold px-2.5 py-1 rounded-sm">
                        Mới
                    </span>
                    )}
                </div>

                </div>

            {/* 2. RATING REVIEWS */}
            <div className="flex items-center text-lg justify-between font-semibold">
            <div className="flex items-center gap-3">
                <span className="text-[#3b1d14] ">
                {product.average_rating?.toFixed(1) || "0.0"}
                </span>
                <div className="flex text-yellow-400 px-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                    {i < Math.round(product.average_rating || 0) ? "★" : "☆"}
                    </span>
                ))}
                </div>
                <span className="text-gray-300 px-1">|</span>
                <span className="text-[#3b1d14] px-1">
                {product.review_count || 0}
                </span>
                <span className="text-gray-500">Đánh giá</span>
            </div>
            
            <span className="text-gray-500 cursor-pointer hover:text-red-500 hover:underline transition text-sm">
                Báo cáo
            </span>
            </div>

            {/* 3. PRICE */}
            <div className="flex items-baseline bg-gray-100 p-5">
            {hasSale ? (
                <>
                <span className="text-3xl font-bold text-rose-600 p-3">
                    {product.sale_price!.toLocaleString()}đ
                </span>
                <span className="text-lg text-gray-400 line-through">
                    {product.price.toLocaleString()}đ
                </span>
                </>
            ) : (
                <span className="text-3xl font-bold text-rose-600">
                {product.price.toLocaleString()}đ
                </span>
            )}
            </div>

            {/* 4. DESCRIPTION */}
            <div>
            <p className="text-lg uppercase font-semibold text-[#3b1d14]">
                Chi tiết sản phẩm
            </p>
            <div className="bg-white border rounded-2xl p-5 text-gray-700 leading-relaxed shadow-sm">
                <div className="grid grid-cols-[max-content_1fr] gap-y-2 text-base">
                {product.category?.name && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Danh mục</span>
                    <span className="text-gray-800 font-medium">
                        {product.category.name}
                    </span>
                    </>
                )}

                {product.stock !== undefined && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Tồn kho</span>
                    <span className="text-gray-800 font-medium">
                        {product.stock}
                    </span>
                    </>
                )}

                {product.package_type && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Loại bao bì</span>
                    <span className="text-gray-800 font-medium">
                        {product.package_type}
                    </span>
                    </>
                )}

                {product.brand?.name && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Thương hiệu</span>
                    <span className="text-gray-800 font-medium">
                        {product.brand.name}
                    </span>
                    </>
                )}
                {product.origin && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Xuất xứ</span>
                    <span className="text-gray-800 font-medium">
                        {product.origin}
                    </span>
                    </>
                )}
                {product.weight && product.weight_unit && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Trọng lượng</span>
                    <span className="text-gray-800 font-medium">
                        {product.weight} {product.weight_unit}
                    </span>
                    </>
                )}
                {product.ingredients && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Thành phần</span>
                    <span className="text-gray-800 font-medium">
                        {product.ingredients}
                    </span>
                    </>
                )}
                {product.nutrition_info && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Thông tin dinh dưỡng</span>
                    <span className="text-gray-800 font-medium">
                        {Object.entries(product.nutrition_info).map(([key, value]) => (
                        <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                        </div>
                        ))}
                    </span>
                    </>
                )}
                {product.description && (
                    <>
                    <span className="text-[#3b1d14] font-semibold pr-8">Mô tả</span>
                    <span className="text-gray-800 font-medium">
                        {product.description}
                    </span>
                    </>
                )}
                </div>
            </div>
            </div>
        </div>
        {/* Quantity picker */}
        <div className="flex items-center">
            <span className="text-lg font-semibold text-[#3b1d14] p-5 uppercase">
                Số lượng
            </span>
            <div className="flex items-center border-[1.5px] border-[#f0ede8] rounded-[10px] overflow-hidden bg-[#fafafa]">
                <button
                onClick={() => changeQty(-1)}
                disabled={qty <= 1}
                className="w-[30px] h-[28px] flex items-center justify-center text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                −
                </button>
                <span className="min-w-[28px] text-center text-base font-bold text-[#1a1a1a]">
                {qty}
                </span>
                <button
                onClick={() => changeQty(1)}
                disabled={qty >= product.stock}
                className="w-[30px] h-[28px] flex items-center justify-center text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                >
                +
                </button>
            </div>
        </div>
        
        <div className="flex items-center gap-5 ml-auto">
            {/* Nút thêm giỏ */}
            <Button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={`p-5 rounded-sm text-2xl font-semibold tracking-wide transition-all duration-300 
                ${
                    isAdded
                    ? "bg-emerald-500 hover:bg-emerald-500"
                    : isOutOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                        : "bg-white border border-[#e7c27d] hover:opacity-90 active:scale-[.98]"
                } text-[#3b1d14]`}
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
            {/* Mua hàng */}
            <Button
                onClick={handleBuyNow}
                disabled={isAdding || isOutOfStock}
                className={`p-5 rounded-sm text-2xl font-semibold tracking-wide transition-all duration-300 
                ${
                    isAdded
                    ? "bg-emerald-500 hover:bg-emerald-500"
                    : isOutOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                        : "bg-[#e7c27d] hover:opacity-90 active:scale-[.98]"
                } text-[#3b1d14]`}
            >
                {isAdded ? (
                <>
                    <Check className="w-4 h-4" /> Đã thêm {qty} vào giỏ!
                </>
                ) : isAdding ? (
                "Đang thêm..."
                ) : isOutOfStock ? (
                <>
                    <p/> Hết hàng
                </>
                ) : (
                <>
                    <p/> Mua Ngay
                </>
                )}
            </Button>
        </div>
    </div>
    );
}