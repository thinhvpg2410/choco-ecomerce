export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ProductList } from "@/components/product/product-list";
import { HeroBanner } from "@/components/ui/hero-banner";
import { getProducts } from "@/services/product.service";
import { generatePagination } from "@/lib/pagination";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import ProductFilters from "../../lib/product-filters";

type SearchParams = {
  page?: string;
  search?: string;
  min_price?: string;
  max_price?: string;
  is_new?: string;
  is_best_seller?: string;
};

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  noStore();

  const params = await searchParams;

  const currentPage =
    Number.isInteger(Number(params.page)) && Number(params.page) > 0
      ? Number(params.page)
      : 1;

  const { products, total, limit } = await getProducts({
    page: currentPage,
    search: params.search,
    min_price: params.min_price,
    max_price: params.max_price,
    is_new: params.is_new === "true",
    is_best_seller: params.is_best_seller === "true",
  });

  const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 1;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <HeroBanner
        image="https://images.unsplash.com/photo-1549007994-cb92caebd54b"
        title="Sản phẩm"
      />

      <div className="container mx-auto px-6 pt-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tất cả sản phẩm <span className="text-pink-600">({total})</span>
          </h1>
        </div>

        {/* FILTER */}
        <ProductFilters />

        {/* LIST */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <p className="text-gray-500">Không có sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <ProductList products={products} />

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="inline-flex items-center gap-1 rounded-lg border bg-white p-1 shadow-sm">
                  {/* Previous */}
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

                  {/* Page Numbers */}
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

                  {/* Next */}
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
    </div>
  );
}
