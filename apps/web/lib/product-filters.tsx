"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  X,
  SlidersHorizontal,
  Check,
  LayoutGrid,
  Store,
} from "lucide-react";
import { getCategories, type Category } from "@/services/category.service";
import { getBrands, type Brand } from "@/services/brand.service";

/* ─── helpers ─────────────────────────────────────── */
function createQueryString(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null)
      sp.set(key, String(value));
  });
  return sp.toString();
}

const priceRanges = [
  { label: "Tất cả mức giá", min: undefined, max: undefined },
  { label: "Dưới 100k", min: 0, max: 100000 },
  { label: "100k – 300k", min: 100000, max: 300000 },
  { label: "300k – 500k", min: 300000, max: 500000 },
  { label: "500k – 1tr", min: 500000, max: 1000000 },
  { label: "Trên 1tr", min: 1000000, max: undefined },
];

const sortOptions = [
  { label: "Mặc định", value: "" },
  { label: "Giá: thấp → cao", value: "price_asc" },
  { label: "Giá: cao → thấp", value: "price_desc" },
  { label: "Mới nhất", value: "newest" },
];

const VARS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root{
  /* primary */
  --a:#FF8A65;
  --a-d:#F97316;
  --a-l:#FFF1EB;
  --a-b:#FED7C3;

  /* text */
  --ink:#2B2B2B;
  --ink2:#5B5B5B;
  --ink3:#9E9E9E;

  /* surfaces */
  --sur:#FFFFFF;
  --bg:#FFFDFB;
  --bdr:#F1E5DD;

  /* radius */
  --r:10px;
  --rsm:7px;
  --rpill:999px;
}
`;

/* ─── core hook ───────────────────────────────────── */
function useProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort_by") || "");

  const isNew = searchParams.get("is_new");
  const isBestSeller = searchParams.get("is_best_seller");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");

  const selectedPrice =
    minPrice !== null
      ? priceRanges.findIndex(
          (r) =>
            r.min !== undefined &&
            String(r.min) === minPrice &&
            (r.max === undefined ? !maxPrice : String(r.max) === maxPrice),
        )
      : 0;

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSort(searchParams.get("sort_by") || "");
  }, [searchParams]);

  const buildParams = (extra: Record<string, any> = {}) => {
    const priceIdx = "price_idx" in extra ? extra.price_idx : selectedPrice;
    const priceRange = priceIdx > 0 ? priceRanges[priceIdx] : null;
    return {
      page: 1,
      search:
        "search" in extra ? extra.search || undefined : search || undefined,
      sort_by:
        "sort_by" in extra ? extra.sort_by || undefined : sort || undefined,
      min_price: priceRange?.min,
      max_price: priceRange?.max,
      is_new:
        "is_new" in extra ? extra.is_new || undefined : isNew || undefined,
      is_best_seller:
        "is_best_seller" in extra
          ? extra.is_best_seller || undefined
          : isBestSeller || undefined,
      category_id: searchParams.get("category_id") || undefined,
      brand_id: searchParams.get("brand_id") || undefined,
    };
  };

  const applyFilters = (extra: Record<string, any> = {}) =>
    router.push(`?${createQueryString(buildParams(extra))}`);

  const handlePriceSelect = (idx: number) =>
    applyFilters({ price_idx: selectedPrice === idx ? 0 : idx });

  const handleSort = (value: string) => {
    setSort(value);
    applyFilters({ sort_by: value });
  };

  const activeFiltersCount = [
    isNew === "true" ? "1" : null,
    isBestSeller === "true" ? "1" : null,
    selectedPrice > 0 ? "1" : null,
    searchParams.get("category_id"),
    searchParams.get("brand_id"),
    search ? "1" : null,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch("");
    setSort("");
    router.push("?page=1");
  };

  const searchDisplayValue = (() => {
    if (search) return search;
    if (isNew === "true" && isBestSeller === "true") return "";
    if (isNew === "true") return "sản phẩm mới";
    if (isBestSeller === "true") return "bán chạy";
    if (searchParams.get("is_featured") === "true") return "nổi bật";
    if (searchParams.get("on_sale") === "true") return "giảm giá";
    return "";
  })();

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
    searchDisplayValue,
  };
}

/* ══════════════════════════════════════════════════════
   DropdownPanel — reusable panel with search + grid
══════════════════════════════════════════════════════ */
type DropdownPanelProps = {
  title: string;
  searchPlaceholder: string;
  items: Array<{ id: string; name: string; image?: string }>;
  activeId: string;
  onSelect: (id: string | null) => void;
  onClose: () => void;
};

function DropdownPanel({
  title,
  searchPlaceholder,
  items,
  activeId,
  onSelect,
  onClose,
}: DropdownPanelProps) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <style>{`
        ${VARS}
        .dp{background:var(--sur);border:1.5px solid var(--bdr);border-radius:var(--r);overflow:hidden;margin-top:6px;}
        .dp-head{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;border-bottom:1px solid var(--bdr);background:var(--bg);}
        .dp-title{font-size:11.5px;font-weight:700;color:var(--ink2);text-transform:uppercase;letter-spacing:.07em;font-family:'Inter',sans-serif;}
        .dp-close{width:26px;height:26px;border-radius:6px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink3);transition:background .15s;}
        .dp-close:hover{background:var(--bdr);}
        .dp-search{padding:8px 10px;border-bottom:1px solid var(--bdr);position:relative;}
        .dp-search-ic{position:absolute;left:19px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
        .dp-search input{width:100%;padding:7px 10px 7px 30px;border:1.5px solid var(--bdr);border-radius:var(--rsm);font-size:13px;font-family:'Inter',sans-serif;color:var(--ink);background:var(--bg);outline:none;}
        .dp-search input:focus{border-color:var(--a);}
        .dp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px;max-height:260px;overflow-y:auto;}
        .dp-grid::-webkit-scrollbar{width:3px;}
        .dp-grid::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:4px;}
        .dp-item{display:flex;align-items:center;gap:7px;padding:8px 9px;border-radius:var(--rsm);border:1.5px solid var(--bdr);cursor:pointer;transition:all .15s;background:#fff;font-family:'Inter',sans-serif;}
        .dp-item:hover{border-color:var(--a-b);background:var(--a-l);}
        .dp-item.on{
  border-color:var(--a);
  background:var(--a-l);

  box-shadow:0 3px 10px rgba(249,115,22,.10);
}
        .dp-item-img{width:28px;height:28px;border-radius:50%;flex-shrink:0;object-fit:cover;background:var(--a-l);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--a-d);}
        .dp-item-name{font-size:12.5px;font-weight:500;color:var(--ink2);flex:1;line-height:1.3;}
        .dp-item.on .dp-item-name{color:var(--a-d);font-weight:600;}
        .dp-item-chk{width:16px;height:16px;border-radius:50%;background:var(--a);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .dp-empty{padding:20px;text-align:center;font-size:13px;color:var(--ink3);font-family:'Inter',sans-serif;}
        .dp-footer{padding:10px 12px;border-top:1px solid var(--bdr);display:flex;justify-content:space-between;align-items:center;gap:8px;}
        .dp-footer-left{font-size:12px;color:var(--ink3);font-family:'Inter',sans-serif;}
        .dp-footer-right{display:flex;gap:6px;}
        .dp-btn-ghost{padding:6px 14px;border:1.5px solid var(--bdr);border-radius:var(--rsm);background:#fff;font-size:12.5px;font-weight:500;color:var(--ink2);cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;}
        .dp-btn-ghost:hover{border-color:var(--ink);color:var(--ink);}
        .dp-btn-solid{padding:6px 16px;border:none;border-radius:var(--rsm);background:var(--ink);color:#fff;font-size:12.5px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:background .15s;}
        .dp-btn-solid:hover{background:var(--a-d);}
      `}</style>

      <div className="dp">
        <div className="dp-head">
          <span className="dp-title">{title}</span>
          <button className="dp-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="dp-search">
          <Search size={13} className="dp-search-ic" />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="dp-grid">
          {filtered.length === 0 ? (
            <div className="dp-empty" style={{ gridColumn: "1/-1" }}>
              Không tìm thấy
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`dp-item ${activeId === item.id ? "on" : ""}`}
                onClick={() => onSelect(activeId === item.id ? null : item.id)}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="dp-item-img"
                  />
                ) : (
                  <span className="dp-item-img">{item.name.charAt(0)}</span>
                )}
                <span className="dp-item-name">{item.name}</span>
                {activeId === item.id && (
                  <span className="dp-item-chk">
                    <Check size={9} color="#fff" />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="dp-footer">
          <span className="dp-footer-left">{items.length} mục</span>
          <div className="dp-footer-right">
            <button className="dp-btn-ghost" onClick={() => onSelect(null)}>
              Bỏ chọn
            </button>
            <button className="dp-btn-solid" onClick={onClose}>
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   ProductSearchBar
══════════════════════════════════════════════════════ */
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
    searchDisplayValue,
  } = useProductFilters();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [openDrop, setOpenDrop] = useState<"cat" | "brand" | null>(null);

  const activeCatId = searchParams.get("category_id") ?? "";
  const activeBrandId = searchParams.get("brand_id") ?? "";

  useEffect(() => {
    getCategories().then(setCategories);
    getBrands().then(setBrands);
  }, []);

  /* resolve slug → id */
  useEffect(() => {
    const catSlug = searchParams.get("category");
    const brandSlug = searchParams.get("brand");
    if (!catSlug && !brandSlug) return;
    if (categories.length === 0 && brands.length === 0) return;
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (catSlug && categories.length > 0) {
      const found = categories.find((c) => (c.slug ?? c.id) === catSlug);
      if (found) {
        params.set("category_id", found.id);
        params.delete("category");
        changed = true;
      }
    }
    if (brandSlug && brands.length > 0) {
      const found = brands.find((b) => (b.slug ?? b.id) === brandSlug);
      if (found) {
        params.set("brand_id", found.id);
        params.delete("brand");
        changed = true;
      }
    }
    if (changed) {
      params.set("page", "1");
      router.replace(`?${params.toString()}`);
    }
  }, [categories, brands, searchParams.toString()]);

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const removeTag = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const activeCat = categories.find((c) => c.id === activeCatId);
  const activeBrand = brands.find((b) => b.id === activeBrandId);

  /* số chip preview hiện trước khi có dropdown */
  const PREVIEW = 3;
  const previewCats = categories.slice(0, PREVIEW);
  const previewBrands = brands.slice(0, PREVIEW);

  return (
    <>
      <style>{`
        ${VARS}
        .sb{font-family:'Inter',sans-serif;display:flex;flex-direction:column;gap:12px;margin-bottom:24px;}

        /* search row */
        .sb-r1{display:flex;gap:8px;align-items:stretch;}
        .sb-si{flex:1;position:relative;display:flex;}
        .sb-sic{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
        .sb-si input{
          flex:1;padding:10px 0 10px 38px;
          border:1.5px solid var(--bdr);border-right:none;
          border-radius:var(--r) 0 0 var(--r);
          font-size:13.5px;font-family:'Inter',sans-serif;font-weight:500;
          color:var(--ink);background:var(--sur);outline:none;transition:border-color .15s;
        }
        .sb-si input::placeholder{color:var(--ink3);}
        .sb-si input:focus{border-color:var(--a);}
        .sb-sbtn{
          padding:10px 20px;
          border:none;
          border-radius:0 var(--r) var(--r) 0;

          background:linear-gradient(135deg,var(--a),var(--a-d));

          color:#fff;
          font-size:13.5px;
          font-weight:600;
          cursor:pointer;
          font-family:'Inter',sans-serif;
          transition:all .15s;
          white-space:nowrap;
        }

        .sb-sbtn:hover{
          filter:brightness(.96);
        }
        .sb-sw{position:relative;}
        .sb-sw select{
          appearance:none;padding:10px 32px 10px 12px;height:100%;
          border:1.5px solid var(--bdr);border-radius:var(--r);
          background:var(--sur);font-size:13.5px;font-family:'Inter',sans-serif;
          font-weight:500;color:var(--ink);outline:none;cursor:pointer;transition:border-color .15s;
        }
        .sb-sw select:focus{border-color:var(--a);}
        .sb-swic{position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--ink3);}

        /* filter row */
        .sb-frow{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}

        /* preview chips (vài cái đầu) */
        .sb-chip{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 12px 6px 6px;border:1.5px solid var(--bdr);border-radius:var(--rpill);
          background:var(--sur);white-space:nowrap;font-size:13px;font-weight:500;
          color:var(--ink2);cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;
        }
        .sb-chip:hover{border-color:var(--a-b);background:var(--a-l);color:var(--a-d);}
        .sb-chip.on{
          border-color:var(--a);
          background:var(--a-l);
          color:var(--a-d);
          font-weight:600;

          box-shadow:0 4px 12px rgba(249,115,22,.12);
        }
        .sb-chip img{width:20px;height:20px;border-radius:50%;object-fit:cover;flex-shrink:0;}
        .sb-chip-ph{width:20px;height:20px;border-radius:50%;background:var(--a-l);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--a-d);flex-shrink:0;}

        /* "Xem thêm" trigger button */
        .sb-more{
          display:inline-flex;align-items:center;gap:6px;
          padding:6px 12px;border:1.5px solid var(--bdr);border-radius:var(--rpill);
          background:var(--sur);font-size:13px;font-weight:500;color:var(--ink2);
          cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;white-space:nowrap;
        }
        .sb-more:hover{border-color:var(--a-b);background:var(--a-l);color:var(--a-d);}
        .sb-more.open{border-color:var(--a);background:var(--a-l);color:var(--a-d);}
        .sb-more-cnt{display:inline-flex;align-items:center;justify-content:center;
          width:17px;height:17px;border-radius:50%;background:var(--a);color:#fff;font-size:10px;font-weight:700;}
        .sb-more-ic{transition:transform .2s;}
        .sb-more.open .sb-more-ic{transform:rotate(180deg);}

        /* section label */
        .sb-lbl{font-size:11px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;}

        /* divider */
        .sb-div{width:1px;height:24px;background:var(--bdr);flex-shrink:0;}

        /* active tags */
        .sb-tags{display:flex;flex-wrap:wrap;align-items:center;gap:6px;}
        .sb-tag{
          display:inline-flex;align-items:center;gap:5px;
          background:var(--a-l);border:1.5px solid var(--a-b);
          color:var(--a-d);font-size:12px;font-weight:600;
          padding:4px 8px 4px 10px;border-radius:var(--rpill);font-family:'Inter',sans-serif;
        }
        .sb-tag button{
          display:flex;align-items:center;justify-content:center;
          width:15px;height:15px;border-radius:50%;background:var(--a-b);
          border:none;cursor:pointer;color:var(--a-d);padding:0;transition:background .15s;
        }
        .sb-tag button:hover{background:var(--a);color:#fff;}
        .sb-clear{
          display:inline-flex;align-items:center;gap:4px;
          font-size:12px;color:var(--ink3);font-weight:500;
          border:1.5px solid var(--bdr);border-radius:var(--rpill);
          padding:4px 12px;background:var(--sur);cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;
        }
        .sb-clear:hover{border-color:#EF4444;color:#EF4444;background:#FEF2F2;}
      `}</style>

      <div className="sb">
        {/* Row 1: search + sort */}
        <div className="sb-r1">
          <div className="sb-si">
            <Search size={15} className="sb-sic" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search || searchDisplayValue}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
            <button className="sb-sbtn" onClick={() => applyFilters()}>
              Tìm kiếm
            </button>
          </div>
          <div className="sb-sw">
            <select value={sort} onChange={(e) => handleSort(e.target.value)}>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="sb-swic" />
          </div>
        </div>

        {/* Row 2: category preview + "Xem thêm" */}
        {categories.length > 0 && (
          <div>
            <div className="sb-lbl">Danh mục</div>
            <div className="sb-frow">
              {previewCats.map((cat) => (
                <button
                  key={cat.id}
                  className={`sb-chip ${activeCatId === cat.id ? "on" : ""}`}
                  onClick={() => {
                    setFilter(
                      "category_id",
                      activeCatId === cat.id ? null : cat.id,
                    );
                    setOpenDrop(null);
                  }}
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} />
                  ) : (
                    <span className="sb-chip-ph">{cat.name.charAt(0)}</span>
                  )}
                  {cat.name}
                </button>
              ))}
              {categories.length > PREVIEW && (
                <button
                  className={`sb-more ${openDrop === "cat" ? "open" : ""}`}
                  onClick={() => setOpenDrop(openDrop === "cat" ? null : "cat")}
                >
                  <LayoutGrid size={13} />
                  Xem thêm
                  <span className="sb-more-cnt">
                    {categories.length - PREVIEW}+
                  </span>
                  <ChevronDown size={12} className="sb-more-ic" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dropdown danh mục */}
        {openDrop === "cat" && categories.length > 0 && (
          <DropdownPanel
            title="Chọn danh mục"
            searchPlaceholder="Tìm danh mục..."
            items={categories}
            activeId={activeCatId}
            onSelect={(id) => setFilter("category_id", id)}
            onClose={() => setOpenDrop(null)}
          />
        )}

        {/* Row 3: brand preview + "Xem thêm" */}
        {brands.length > 0 && (
          <div>
            <div className="sb-lbl">Thương hiệu</div>
            <div className="sb-frow">
              {previewBrands.map((brand) => (
                <button
                  key={brand.id}
                  className={`sb-chip ${activeBrandId === brand.id ? "on" : ""}`}
                  onClick={() => {
                    setFilter(
                      "brand_id",
                      activeBrandId === brand.id ? null : brand.id,
                    );
                    setOpenDrop(null);
                  }}
                >
                  {brand.image ? (
                    <img src={brand.image} alt={brand.name} />
                  ) : (
                    <span className="sb-chip-ph">{brand.name.charAt(0)}</span>
                  )}
                  {brand.name}
                </button>
              ))}
              {brands.length > PREVIEW && (
                <button
                  className={`sb-more ${openDrop === "brand" ? "open" : ""}`}
                  onClick={() =>
                    setOpenDrop(openDrop === "brand" ? null : "brand")
                  }
                >
                  <Store size={13} />
                  Xem thêm
                  <span className="sb-more-cnt">
                    {brands.length - PREVIEW}+
                  </span>
                  <ChevronDown size={12} className="sb-more-ic" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dropdown thương hiệu */}
        {openDrop === "brand" && brands.length > 0 && (
          <DropdownPanel
            title="Chọn thương hiệu"
            searchPlaceholder="Tìm thương hiệu..."
            items={brands}
            activeId={activeBrandId}
            onSelect={(id) => setFilter("brand_id", id)}
            onClose={() => setOpenDrop(null)}
          />
        )}

        {/* Active tags */}
        {activeFiltersCount > 0 && (
          <div className="sb-tags">
            {search && (
              <span className="sb-tag">
                "{search}"
                <button
                  onClick={() => {
                    setSearch("");
                    applyFilters({ search: undefined });
                  }}
                >
                  <X size={9} />
                </button>
              </span>
            )}
            {activeCat && (
              <span className="sb-tag">
                {activeCat.name}
                <button onClick={() => removeTag("category_id")}>
                  <X size={9} />
                </button>
              </span>
            )}
            {activeBrand && (
              <span className="sb-tag">
                {activeBrand.name}
                <button onClick={() => removeTag("brand_id")}>
                  <X size={9} />
                </button>
              </span>
            )}
            {selectedPrice > 0 && (
              <span className="sb-tag">
                {priceRanges[selectedPrice].label}
                <button onClick={() => handlePriceSelect(selectedPrice)}>
                  <X size={9} />
                </button>
              </span>
            )}
            {isNew === "true" && (
              <span className="sb-tag">
                Hàng mới
                <button onClick={() => applyFilters({ is_new: undefined })}>
                  <X size={9} />
                </button>
              </span>
            )}
            {isBestSeller === "true" && (
              <span className="sb-tag">
                Bán chạy
                <button
                  onClick={() => applyFilters({ is_best_seller: undefined })}
                >
                  <X size={9} />
                </button>
              </span>
            )}
            <button className="sb-clear" onClick={clearAll}>
              <X size={11} /> Xoá bộ lọc ({activeFiltersCount})
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   ProductSidebarFilters
══════════════════════════════════════════════════════ */
export function ProductSidebarFilters() {
  const {
    isNew,
    isBestSeller,
    selectedPrice,
    handlePriceSelect,
    applyFilters,
  } = useProductFilters();

  return (
    <>
      <style>{`
        ${VARS}
        .sf{display:flex;flex-direction:column;gap:10px;font-family:'Inter',sans-serif;}
        .sf-card{background:var(--sur);border:1.5px solid var(--bdr);border-radius:var(--r);overflow:hidden;}
        .sf-head{padding:10px 13px;background:var(--bg);border-bottom:1.5px solid var(--bdr);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);display:flex;align-items:center;gap:6px;}
        .sf-body{padding:7px 8px 9px;}
        .sf-opt{display:flex;align-items:center;gap:8px;width:100%;padding:8px 9px;border-radius:var(--rsm);border:none;background:transparent;text-align:left;cursor:pointer;font-size:13px;font-weight:500;color:var(--ink2);font-family:'Inter',sans-serif;transition:all .12s;}
        .sf-opt:hover{background:var(--a-l);color:var(--a-d);}
        .sf-opt.on{background:var(--a-l);color:var(--a-d);font-weight:600;}
        .sf-radio{width:16px;height:16px;border-radius:50%;flex-shrink:0;border:2px solid var(--bdr);display:flex;align-items:center;justify-content:center;transition:all .12s;}
        .sf-opt.on .sf-radio{border-color:var(--a);background:var(--a);}
        .sf-rdot{width:6px;height:6px;border-radius:50%;background:#fff;}
        .sf-tr{display:flex;align-items:center;justify-content:space-between;padding:8px 9px;border-radius:var(--rsm);width:100%;border:none;background:transparent;cursor:pointer;font-family:'Inter',sans-serif;transition:background .12s;}
        .sf-tr:hover{background:var(--a-l);}
        .sf-tlbl{font-size:13px;font-weight:500;color:var(--ink2);}
        .sf-sw{width:32px;height:18px;border-radius:var(--rpill);position:relative;transition:background .18s;flex-shrink:0;}
        .sf-sw.on{background:var(--a);}
        .sf-sw.off{background:var(--bdr);}
        .sf-knob{position:absolute;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left .18s;}
        .sf-sw.on .sf-knob{left:16px;}
        .sf-sw.off .sf-knob{left:2px;}
      `}</style>

      <div className="sf">
        <div className="sf-card">
          <div className="sf-head">
            <SlidersHorizontal size={12} />
            Khoảng giá
          </div>
          <div className="sf-body">
            {priceRanges.map((range, idx) => (
              <button
                key={idx}
                className={`sf-opt ${selectedPrice === idx ? "on" : ""}`}
                onClick={() => handlePriceSelect(idx)}
              >
                <span className="sf-radio">
                  {selectedPrice === idx && <span className="sf-rdot" />}
                </span>
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sf-card">
          <div className="sf-head">Lọc nhanh</div>
          <div className="sf-body">
            <button
              className="sf-tr"
              onClick={() =>
                applyFilters({ is_new: isNew === "true" ? undefined : true })
              }
            >
              <span className="sf-tlbl">✨ Hàng mới về</span>
              <span className={`sf-sw ${isNew === "true" ? "on" : "off"}`}>
                <span className="sf-knob" />
              </span>
            </button>
            <button
              className="sf-tr"
              onClick={() =>
                applyFilters({
                  is_best_seller: isBestSeller === "true" ? undefined : true,
                })
              }
            >
              <span className="sf-tlbl">🔥 Bán chạy nhất</span>
              <span
                className={`sf-sw ${isBestSeller === "true" ? "on" : "off"}`}
              >
                <span className="sf-knob" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
