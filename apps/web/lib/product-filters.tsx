"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getBrands, type Brand } from "@/services/brand.service";
import { getCategories, type Category } from "@/services/category.service";

function createQueryString(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      sp.set(key, String(value));
    }
  });
  return sp.toString();
}

const priceRanges = [
  { label: "Dưới 100k", min: 0, max: 100000 },
  { label: "100k – 300k", min: 100000, max: 300000 },
  { label: "300k – 500k", min: 300000, max: 500000 },
  { label: "500k – 1tr", min: 500000, max: 1000000 },
  { label: "Trên 1tr", min: 1000000, max: undefined },
];

const sortOptions = [
  { label: "Mặc định", value: "" },
  { label: "Giá tăng dần", value: "price_asc" },
  { label: "Giá giảm dần", value: "price_desc" },
];

function ScrollFilterRow({
  title,
  items,
  selectedId,
  onSelect,
  loading,
}: {
  title: string;
  items: { id: string | number; name: string; image?: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? 200 : -200,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col flex-1">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1 flex-shrink-0">
        {title}
      </p>

      <div className="flex-1 flex items-center">
        {loading ? (
          <div className="flex gap-5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-full">
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item) => {
                const isActive = selectedId === String(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(String(item.id))}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${
                        isActive
                          ? "border-pink-500"
                          : "border-gray-200 group-hover:border-pink-300"
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center text-lg font-bold ${
                            isActive
                              ? "bg-pink-50 text-pink-500"
                              : "bg-gray-50 text-gray-400"
                          }`}
                        >
                          {item.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs text-center max-w-[72px] leading-tight transition-colors ${
                        isActive
                          ? "text-pink-600 font-medium"
                          : "text-gray-600 group-hover:text-pink-500"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {items.length > 5 && (
              <>
                <button
                  onClick={() => scroll("left")}
                  className="absolute -left-3 top-8 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-pink-500 hover:border-pink-300 transition-colors z-10 text-base"
                >
                  ‹
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="absolute -right-3 top-8 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-pink-500 hover:border-pink-300 transition-colors z-10 text-base"
                >
                  ›
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const isNew = searchParams.get("is_new");
  const isBestSeller = searchParams.get("is_best_seller");
  const selectedBrandId = searchParams.get("brand_id");
  const selectedCategoryId = searchParams.get("category_id");

  useEffect(() => {
    Promise.all([getBrands(), getCategories()]).then(([b, c]) => {
      setBrands(b);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const applyFilters = (extra: any = {}) => {
    const priceSelected =
      selectedPrice !== null ? priceRanges[selectedPrice] : null;
    const params: any = {
      page: 1,
      search: search || undefined,
      min_price: priceSelected?.min,
      max_price: priceSelected?.max,
      sort:
        extra.sort !== undefined ? extra.sort || undefined : sort || undefined,
      is_new: extra.is_new ?? (isNew || undefined),
      is_best_seller: extra.is_best_seller ?? (isBestSeller || undefined),
      brand_id:
        extra.brand_id !== undefined
          ? extra.brand_id || undefined
          : selectedBrandId || undefined,
      category_id:
        extra.category_id !== undefined
          ? extra.category_id || undefined
          : selectedCategoryId || undefined,
    };
    router.push(`?${createQueryString(params)}`);
  };

  const handlePriceSelect = (idx: number) => {
    const next = selectedPrice === idx ? null : idx;
    setSelectedPrice(next);
    const selected = next !== null ? priceRanges[next] : null;
    router.push(
      `?${createQueryString({
        page: 1,
        search: search || undefined,
        sort: sort || undefined,
        min_price: selected?.min,
        max_price: selected?.max,
        is_new: isNew || undefined,
        is_best_seller: isBestSeller || undefined,
        brand_id: selectedBrandId || undefined,
        category_id: selectedCategoryId || undefined,
      })}`,
    );
  };

  const handleSort = (value: string) => {
    setSort(value);
    applyFilters({ sort: value });
  };

  const activeFiltersCount = [
    selectedBrandId,
    selectedCategoryId,
    isNew,
    isBestSeller,
    selectedPrice !== null ? "1" : null,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch("");
    setSelectedPrice(null);
    setSort("");
    router.push("?page=1");
  };

  const optionCls = (active: boolean) =>
    `text-left w-full text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
      active
        ? "bg-pink-50 text-pink-600 font-medium"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="mb-8 flex flex-col gap-3">
      {/* HÀNG 1: Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
        />
        <button
          onClick={() => applyFilters()}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          Tìm kiếm
        </button>
      </div>

      {/* HÀNG 2: Active pills + Sort */}
      <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {selectedCategoryId && (
            <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-300 text-pink-600 text-xs px-3 py-1.5 rounded-full font-medium">
              {categories.find((c) => String(c.id) === selectedCategoryId)
                ?.name ?? "Danh mục"}
              <button
                onClick={() => applyFilters({ category_id: null })}
                className="ml-1 hover:text-pink-800 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {selectedBrandId && (
            <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-300 text-pink-600 text-xs px-3 py-1.5 rounded-full font-medium">
              {brands.find((b) => String(b.id) === selectedBrandId)?.name ??
                "Thương hiệu"}
              <button
                onClick={() => applyFilters({ brand_id: null })}
                className="ml-1 hover:text-pink-800 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {selectedPrice !== null && (
            <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-300 text-pink-600 text-xs px-3 py-1.5 rounded-full font-medium">
              {priceRanges[selectedPrice].label}
              <button
                onClick={() => handlePriceSelect(selectedPrice)}
                className="ml-1 hover:text-pink-800 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {isNew === "true" && (
            <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-300 text-pink-600 text-xs px-3 py-1.5 rounded-full font-medium">
              Sản phẩm mới
              <button
                onClick={() => applyFilters({ is_new: undefined })}
                className="ml-1 hover:text-pink-800 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {isBestSeller === "true" && (
            <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-300 text-pink-600 text-xs px-3 py-1.5 rounded-full font-medium">
              Bán chạy
              <button
                onClick={() => applyFilters({ is_best_seller: undefined })}
                className="ml-1 hover:text-pink-800 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-pink-500 border border-gray-200 hover:border-pink-300 rounded-full px-3 py-1.5 transition-colors bg-white"
            >
              Xóa bộ lọc ({activeFiltersCount})
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white text-gray-600"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* HÀNG 3: Filter blocks */}
      {/* grid-cols-[auto_1fr]: cột trái tự co theo nội dung, cột phải chiếm phần còn lại */}
      <div className="grid grid-cols-[auto_1fr] gap-3 items-stretch">
        {/* CỘT TRÁI: Lọc nhanh + Khoảng giá — dọc */}
        <div className="flex flex-col gap-3 w-36">
          <div className="bg-white border border-gray-100 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              Lọc nhanh
            </p>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() =>
                  applyFilters({ is_new: undefined, is_best_seller: undefined })
                }
                className={optionCls(!isNew && !isBestSeller)}
              >
                Tất cả
              </button>
              <button
                onClick={() =>
                  applyFilters({ is_new: true, is_best_seller: undefined })
                }
                className={optionCls(isNew === "true")}
              >
                Sản phẩm mới
              </button>
              <button
                onClick={() =>
                  applyFilters({ is_best_seller: true, is_new: undefined })
                }
                className={optionCls(isBestSeller === "true")}
              >
                Bán chạy
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 flex-1">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              Khoảng giá
            </p>
            <div className="flex flex-col gap-0.5">
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePriceSelect(idx)}
                  className={optionCls(selectedPrice === idx)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Danh mục + Thương hiệu — dọc, mỗi đứa 50% chiều cao */}
        <div className="flex flex-col gap-3">
          <ScrollFilterRow
            title="Danh mục"
            items={categories.map((c) => ({ ...c, id: String(c.id) }))}
            selectedId={selectedCategoryId}
            onSelect={(id) =>
              applyFilters({
                category_id: selectedCategoryId === id ? null : id,
              })
            }
            loading={loading}
          />
          <ScrollFilterRow
            title="Thương hiệu"
            items={brands.map((b) => ({ ...b, id: String(b.id) }))}
            selectedId={selectedBrandId}
            onSelect={(id) =>
              applyFilters({ brand_id: selectedBrandId === id ? null : id })
            }
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
