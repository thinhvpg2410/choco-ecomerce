// app/product/[id]/page.tsx

import { notFound } from "next/navigation";
import api from "@/services/axios";
import { ProductItem } from "@/components/product/product-item";
import { Product } from "@/types/type";
import ReviewList from "@/components/review/review-list";
import ProductImageGallery from "@/components/product/product-image-gallery";
import SameBrandProducts from "@/components/product/same-brand-products";

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

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── BREADCRUMB ── */}
      {/* <div className="border-b border-gray-100 bg-[#FFF0F6]">
        <div className="max-w-6xl mx-auto px-6 py-3 text-sm text-gray-400 flex items-center gap-2">
          <span className="hover:text-rose-500 cursor-pointer transition-colors">
            Trang chủ
          </span>
          <span>/</span>
          <span className="hover:text-rose-500 cursor-pointer transition-colors">
            Sản phẩm
          </span>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[240px]">
            {product.name}
          </span>
        </div>
      </div> */}

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* ── PRODUCT CARD ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0 items-start">
            {/* LEFT — IMAGE */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100 ">
              <div className="sticky top-24">
                <ProductImageGallery
                  productId={product.id}
                  mainImage={product.image_url}
                  productName={product.name}
                />
              </div>
            </div>

            {/* RIGHT — ProductItem tự render toàn bộ: brand, tên, giá, mô tả, actions */}
            <div className="p-8 lg:p-10">
              <ProductItem product={product as any} />
            </div>
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-rose-400" />
            <h2 className="text-xl font-bold text-gray-800">
              Đánh giá sản phẩm
            </h2>
          </div>
          <ReviewList productId={id} />
        </div>

        {/* ── SAME BRAND ── */}
        {product.brand_id && (
          <SameBrandProducts
            brandId={product.brand_id}
            excludeProductId={product.id}
          />
        )}
      </div>
    </div>
  );
}
