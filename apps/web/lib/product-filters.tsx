"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function createQueryString(params: Record<string, any>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

const priceRanges = [
  { label: "Dưới 100,000đ", min: 0, max: 100000 },
  { label: "100,000đ - 300,000đ", min: 100000, max: 300000 },
  { label: "300,000đ - 500,000đ", min: 300000, max: 500000 },
  { label: "500,000đ - 1,000,000đ", min: 500000, max: 1000000 },
  { label: "Trên 1,000,000đ", min: 1000000, max: undefined },
];

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  const isNew = searchParams.get("is_new");
  const isBestSeller = searchParams.get("is_best_seller");

  const applyFilters = (extra: any = {}) => {
    const selected = priceRanges[selectedPrice ?? -1];

    const query = createQueryString({
      page: 1,
      search,
      min_price: selected?.min,
      max_price: selected?.max,
      is_new: isNew,
      is_best_seller: isBestSeller,
      ...extra,
    });

    router.push(`?${query}`);
  };

  return (
    <div className="flex gap-8 mb-8">
      {/* LEFT MENU */}
      <div className="w-64 bg-white rounded-xl border p-5 space-y-4">
        <h3 className="text-lg font-semibold">Danh mục</h3>

        <div className="flex flex-col gap-3 text-gray-700">
          <button
            onClick={() =>
              applyFilters({ is_new: undefined, is_best_seller: undefined })
            }
            className="text-left hover:text-red-500"
          >
            <span
              className={
                !isNew && !isBestSeller ? "border-b-2 border-red-500 pb-1" : ""
              }
            >
              Tất cả
            </span>
          </button>

          <button
            onClick={() =>
              applyFilters({ is_new: true, is_best_seller: undefined })
            }
            className="text-left hover:text-red-500"
          >
            <span className={isNew ? "border-b-2 border-red-500 pb-1" : ""}>
              Sản phẩm mới
            </span>
          </button>

          <button
            onClick={() =>
              applyFilters({ is_best_seller: true, is_new: undefined })
            }
            className="text-left hover:text-red-500"
          >
            <span
              className={isBestSeller ? "border-b-2 border-red-500 pb-1" : ""}
            >
              Sản phẩm bán chạy
            </span>
          </button>
        </div>

        {/* PRICE FILTER */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">GIÁ SẢN PHẨM</h4>

          <div className="space-y-2">
            {priceRanges.map((range, index) => {
              const isChecked = selectedPrice === index;

              return (
                <label
                  key={index}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      // 👉 nếu click lại cái đang chọn → bỏ chọn
                      if (isChecked) {
                        setSelectedPrice(null);
                      } else {
                        setSelectedPrice(index);
                      }
                    }}
                  />
                  {range.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 space-y-4">
        {/* SEARCH */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2"
          />

          <button
            onClick={() => applyFilters()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg"
          >
            Tìm
          </button>
        </div>
      </div>
    </div>
  );
}
