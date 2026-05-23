export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ProductList } from "@/components/product/product-list";
import { HeroBanner } from "@/components/ui/hero-banner";
import { getProducts } from "@/services/product.service";
import { generatePagination } from "@/lib/pagination";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  ProductSearchBar,
  ProductSidebarFilters,
} from "../../../lib/product-filters"; // ← sửa đường dẫn nếu cần

type SearchParams = {
  page?: string;
  search?: string;
  min_price?: string;
  max_price?: string;
  is_new?: string;
  is_best_seller?: string;
  brand_id?: string; // ← THÊM
  category_id?: string; // ← THÊM
};

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  noStore();

  const params = await searchParams;
  console.log("📌 searchParams:", params);

  const currentPage =
    Number.isInteger(Number(params.page)) && Number(params.page) > 0
      ? Number(params.page)
      : 1;

  const { products, total, limit } = await getProducts({
    page: currentPage,
    limit: 9,
    search: params.search,
    min_price: params.min_price,
    max_price: params.max_price,
    is_new: params.is_new === "true",
    is_best_seller: params.is_best_seller === "true",
    brand_id: params.brand_id, // ← THÊM DÒNG NÀY
    category_id: params.category_id, // ← THÊM DÒNG NÀY
  });

  const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div>
        <div className="px-6 py-3 bg-[#FFF0F6]">
          {/* Breadcrumb */}
          <div className="w-full mx-auto py-2 text-base text-[#3b1d14] flex items-center gap-2 font-serif">
            <a href="/" className="flex items-center">
              <img src="/image/home.png" alt="home" className="w-5 h-5" />
            </a>
            <span>›</span>
            <a href="/product" className="hover:text-[#6b4f3b]">
              Sản phẩm
            </a>
          </div>

          {/* Banner */}
          <div className="relative overflow-hidden rounded-sm">
            <img
              src="/image/bg.png"
              alt="privacy"
              className="w-full h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-[#FFC1DA]/30"></div>
            <div className="absolute inset-4 border-2 border-[#FFF0F6] pointer-events-none"></div>
            <h1
              className="absolute inset-0 flex items-center justify-center 
                text-[#D85A8A] text-8xl tracking-widest uppercase"
            >
              SẢN PHẨM
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#3b1d14]">
            Tất cả sản phẩm <span className="text-[#FF7FB8]">({total})</span>
          </h1>
        </div>

        <ProductSearchBar />

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border">
                <p className="text-[#3b1d14]">Không có sản phẩm nào.</p>
              </div>
            ) : (
              <>
                <ProductList products={products} />
                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="inline-flex items-center gap-1 rounded-lg border bg-white p-1 shadow-sm">
                      <Link
                        href={`?page=${Math.max(1, currentPage - 1)}`}
                        prefetch={false}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage <= 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        ← Trước
                      </Link>

                      {generatePagination(currentPage, totalPages).map(
                        (page, idx) => (
                          <span key={idx}>
                            {page === "..." ? (
                              <span className="px-3 py-2 text-gray-400">…</span>
                            ) : (
                              <Link
                                href={`?page=${page}`}
                                prefetch={false}
                                className={`min-w-[40px] h-10 flex items-center justify-center rounded-md text-sm font-medium border transition-all ${
                                  page === currentPage
                                    ? "bg-red-500 text-white border-red-500"
                                    : "border-transparent hover:bg-gray-100"
                                }`}
                              >
                                {page}
                              </Link>
                            )}
                          </span>
                        ),
                      )}

                      <Link
                        href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                        prefetch={false}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage >= totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Sau →
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <ProductSidebarFilters />
          </aside>
        </div>
      </div>
    </div>
  );
}
