// app/product/[id]/page.tsx

import { notFound } from "next/navigation";
import api from "@/services/axios";
import { ProductItem } from "@/components/product/product-item";
import { Product } from "@/types/type";
import ReviewList from "@/components/review/review-list";
import ProductImageGallery from "@/components/product/product-image-gallery";
import SameBrandProducts from "@/components/product/same-brand-products";
import { ChevronRight, Home, Star } from "lucide-react";

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

  // ← bỏ toàn bộ phần useSelector và cartQty ở đây

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-[0_1px_0_0_#f0f0f0]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-1.5 text-sm">
          <Home className="w-3.5 h-3.5 text-gray-400" />
          <a href="/" className="text-gray-500 hover:text-orange-500 cursor-pointer transition-colors">
            Trang chủ
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <a href="/product" className="text-gray-500 hover:text-orange-500 cursor-pointer transition-colors">
            Sản phẩm
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-800 font-medium truncate max-w-[280px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* ── PRODUCT CARD ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden border border-gray-100"
          style={{
            boxShadow:
              "0 2px 16px -4px rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.04)",
          }}
        >
          <div className="grid md:grid-cols-2 items-start">
            {/* LEFT — IMAGE */}
            <div
              className="relative p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-100"
              style={{ background: "#FAFAFA" }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-[0.04] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at top right, #f97316 0%, transparent 70%)",
                }}
              />
              <div className="sticky top-20">
                <ProductImageGallery
                  productId={product.id}
                  mainImage={product.image_url}
                  productName={product.name}
                />
              </div>
            </div>

            {/* RIGHT — Info */}
            <div className="p-8 lg:p-12">
              <ProductItem product={product} /> {/* ← bỏ cartQty prop */}
            </div>
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-6 rounded-full bg-orange-500" />
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Đánh giá sản phẩm
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
              <span>Xác thực từ người mua</span>
            </div>
          </div>

          <div className="p-8">
            <ReviewList productId={id} />
          </div>
        </div>

        {/* ── SAME BRAND ── */}
        {product.brand_id && (
          <SameBrandProducts
            brandId={product.brand_id}
            excludeProductId={product.id}
          />
        )}

        <div className="h-6" />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .product-detail-animate > * {
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .product-detail-animate > *:nth-child(1) { animation-delay: 0ms; }
        .product-detail-animate > *:nth-child(2) { animation-delay: 80ms; }
        .product-detail-animate > *:nth-child(3) { animation-delay: 150ms; }
      `}</style>
    </div>
  );
}