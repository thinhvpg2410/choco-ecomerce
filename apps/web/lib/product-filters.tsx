"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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

function useProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");

  const isNew = searchParams.get("is_new");
  const isBestSeller = searchParams.get("is_best_seller");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");

  const selectedPrice =
    minPrice !== null
      ? priceRanges.findIndex(
          (r) =>
            String(r.min) === minPrice &&
            (r.max === undefined ? !maxPrice : String(r.max) === maxPrice),
        )
      : -1;

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSort(searchParams.get("sort") || "");
  }, [searchParams]);

  const buildParams = (extra: Record<string, any> = {}) => {
    const priceIdx = "price_idx" in extra ? extra.price_idx : selectedPrice;
    const priceRange = priceIdx >= 0 ? priceRanges[priceIdx] : null;

    return {
      page: 1,
      search:
        "search" in extra ? extra.search || undefined : search || undefined,
      sort: "sort" in extra ? extra.sort || undefined : sort || undefined,
      min_price: priceRange?.min,
      max_price: priceRange?.max,
      is_new:
        "is_new" in extra ? extra.is_new || undefined : isNew || undefined,
      is_best_seller:
        "is_best_seller" in extra
          ? extra.is_best_seller || undefined
          : isBestSeller || undefined,
    };
  };

  const applyFilters = (extra: Record<string, any> = {}) => {
    const params = buildParams(extra);
    router.push(`?${createQueryString(params)}`);
  };

  const handlePriceSelect = (idx: number) => {
    const next = selectedPrice === idx ? -1 : idx;
    applyFilters({ price_idx: next });
  };

  const handleSort = (value: string) => {
    setSort(value);
    applyFilters({ sort: value });
  };

  const activeFiltersCount = [
    isNew,
    isBestSeller,
    selectedPrice >= 0 ? "1" : null,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch("");
    setSort("");
    router.push("?page=1");
  };

  const optionCls = (active: boolean) =>
    `text-left w-full text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
      active
        ? "bg-pink-50 text-pink-600 font-medium"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  return {
    search,
    setSearch,
    sort,
    isNew,
    isBestSeller,
    selectedPrice,
    applyFilters,
    handlePriceSelect,
    handleSort,
    activeFiltersCount,
    clearAll,
    optionCls,
  };
}

export function ProductSearchBar() {
  const {
    search,
    setSearch,
    sort,
    isNew,
    isBestSeller,
    selectedPrice,
    applyFilters,
    handleSort,
    handlePriceSelect,
    activeFiltersCount,
    clearAll,
  } = useProductFilters();

  return (
    <div className="mb-8 space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] items-stretch">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
          />
          <button
            onClick={() => applyFilters()}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2.5 rounded-lg text-lg transition-colors whitespace-nowrap"
          >
            Tìm kiếm
          </button>
        </div>

        <label className="relative block">
          <span className="sr-only">Sắp xếp</span>
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white text-gray-600"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {selectedPrice >= 0 && (
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
    </div>
  );
}

export function ProductSidebarFilters() {
  const {
    isNew,
    isBestSeller,
    selectedPrice,
    handlePriceSelect,
    applyFilters,
    optionCls,
  } = useProductFilters();

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
          Lọc nhanh
        </p>
        <div className="flex flex-col gap-2">
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

      <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
          Khoảng giá
        </p>
        <div className="flex flex-col gap-2">
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
  );
}
