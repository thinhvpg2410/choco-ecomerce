export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ProductList } from "@/components/product/product-list";
import { getProducts } from "@/services/product.service";
import { generatePagination } from "@/lib/pagination";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  ProductSearchBar,
  ProductSidebarFilters,
} from "../../../lib/product-filters";

type SearchParams = {
  page?: string;
  search?: string;
  min_price?: string;
  max_price?: string;
  is_new?: string;
  is_best_seller?: string;
  brand_id?: string;
  category_id?: string;
  sort_by?: string;
  category?: string;
  brand?: string;
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
    limit: 9,
    search: params.search,
    min_price: params.min_price,
    max_price: params.max_price,
    is_new: params.is_new === "true",
    is_best_seller: params.is_best_seller === "true",
    brand_id: params.brand_id,
    category_id: params.category_id,
    sort_by: params.sort_by,
  });

  const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 1;

  const pageHref = (p: number) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.min_price) q.set("min_price", params.min_price);
    if (params.max_price) q.set("max_price", params.max_price);
    if (params.is_new) q.set("is_new", params.is_new);
    if (params.is_best_seller) q.set("is_best_seller", params.is_best_seller);
    if (params.brand_id) q.set("brand_id", params.brand_id);
    if (params.category_id) q.set("category_id", params.category_id);
    if (params.sort_by) q.set("sort_by", params.sort_by);
    q.set("page", String(p));
    return `?${q.toString()}`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        :root {
  /* primary */
  --p:           #FF8A65;
  --p-dark:      #F97316;
  --p-light:     #FFF1EB;
  --p-border:    #FED7C3;

  /* text */
  --ink:         #2B2B2B;
  --ink2:        #5B5B5B;
  --ink3:        #9E9E9E;

  /* surfaces */
  --surface:     #FFFFFF;
  --bg:          #FFFDFB;
  --border:      #F1E5DD;

  /* radius */
  --radius-sm:   8px;
  --radius:      12px;
  --radius-lg:   16px;
}

        .pp-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Inter', sans-serif;
          padding-bottom: 80px;
        }

        /* ── HERO ── */
        .pp-hero {
          background: var(--surface);
          border-bottom: 1.5px solid var(--border);
          padding: 16px 28px 0;
        }
        .pp-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: var(--ink3);
          margin-bottom: 16px;
        }
        .pp-breadcrumb a { color: var(--ink3); text-decoration: none; transition: color .15s; }
        .pp-breadcrumb a:hover { color: var(--p); }
        .pp-breadcrumb-sep { color: var(--border); }

        .pp-banner {
          position: relative; border-radius: 14px 14px 0 0;
          overflow: hidden; height: 200px;
        }
        .pp-banner img { width: 100%; height: 100%; object-fit: cover; }
        .pp-banner-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,23,42,.52) 0%, rgba(15,23,42,.15) 100%);
        }
        .pp-banner-title {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 42px; font-weight: 800;
          letter-spacing: .06em; text-transform: uppercase;
          color: #fff;
        }
        .pp-banner-badge {
          position: absolute; bottom: 16px; right: 20px;
          background: rgba(255,255,255,.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 13px; font-weight: 600; color: #fff;
        }

        /* ── BODY ── */
        .pp-body { max-width: 1400px; margin: 0 auto; padding: 28px 28px 0; }
        .pp-top-row {
          display: flex; align-items: baseline; margin-bottom: 20px; gap: 8px;
        }
        .pp-heading { font-size: 22px; font-weight: 700; color: var(--ink); }
        .pp-count { font-size: 14px; font-weight: 500; color: var(--ink3); }

        /* ── LAYOUT ── */
        .pp-grid {
          display: grid;
          grid-template-columns: 1fr 256px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .pp-grid { grid-template-columns: 1fr; }
          .pp-sidebar { display: none; }
        }
        .pp-sidebar { position: sticky; top: 80px; }

        /* ── EMPTY ── */
        .pp-empty {
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: var(--radius-lg); padding: 60px 20px; text-align: center;
        }
        .pp-empty-icon { font-size: 36px; margin-bottom: 10px; }
        .pp-empty-text { font-size: 14px; color: var(--ink3); font-weight: 500; }

        /* ── PAGINATION ── */
        .pp-pagination { display: flex; justify-content: center; margin-top: 48px; }
        .pp-pag-inner {
          display: inline-flex; align-items: center; gap: 2px;
          background: var(--surface); border: 1.5px solid var(--border);
          border-radius: var(--radius-lg); padding: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .pp-pag-btn {
          padding: 8px 16px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 600; color: var(--ink2);
          text-decoration: none; transition: all .15s;
          font-family: 'Inter', sans-serif;
        }
        .pp-pag-btn:hover:not(.disabled) { background: var(--p-light); color: var(--p); }
        .pp-pag-btn.disabled { color: var(--border); pointer-events: none; }
        .pp-pag-num {
          min-width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
          color: var(--ink2); text-decoration: none; transition: all .15s;
          font-family: 'Inter', sans-serif;
        }
        .pp-pag-num:hover { background: var(--p-light); color: var(--p); }
        .pp-pag-num.current { background: var(--p); color: #fff; }
        .pp-pag-dots { padding: 0 4px; color: var(--ink3); font-weight: 600; }
      `}</style>

      <div className="pp-root">
        {/* HERO */}
        <div className="pp-hero">
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            <div className="pp-breadcrumb">
              <a href="/">
                <img
                  src="/image/home.png"
                  alt="home"
                  style={{ width: 14, height: 14, verticalAlign: "middle" }}
                />
              </a>
              <span className="pp-breadcrumb-sep">›</span>
              <a href="/product">Sản phẩm</a>
            </div>
            <div className="pp-banner">
              <img src="/image/bg.png" alt="Sản phẩm" />
              <div className="pp-banner-overlay" />
              <div className="pp-banner-title">Sản phẩm</div>
              <div className="pp-banner-badge">{total} sản phẩm</div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="pp-body">
          <div className="pp-top-row">
            <span className="pp-heading">Tất cả sản phẩm</span>
            <span className="pp-count">({total} sản phẩm)</span>
          </div>

          <ProductSearchBar />

          <div className="pp-grid">
            {/* MAIN */}
            <div>
              {products.length === 0 ? (
                <div className="pp-empty">
                  <div className="pp-empty-icon">🔍</div>
                  <div className="pp-empty-text">
                    Không có sản phẩm nào phù hợp.
                  </div>
                </div>
              ) : (
                <>
                  <ProductList products={products} />

                  {totalPages > 1 && (
                    <div className="pp-pagination">
                      <div className="pp-pag-inner">
                        <Link
                          href={pageHref(Math.max(1, currentPage - 1))}
                          prefetch={false}
                          className={`pp-pag-btn ${currentPage <= 1 ? "disabled" : ""}`}
                        >
                          ← Trước
                        </Link>

                        {generatePagination(currentPage, totalPages).map(
                          (page, idx) =>
                            page === "..." ? (
                              <span key={idx} className="pp-pag-dots">
                                …
                              </span>
                            ) : (
                              <Link
                                key={idx}
                                href={pageHref(Number(page))}
                                prefetch={false}
                                className={`pp-pag-num ${page === currentPage ? "current" : ""}`}
                              >
                                {page}
                              </Link>
                            ),
                        )}

                        <Link
                          href={pageHref(Math.min(totalPages, currentPage + 1))}
                          prefetch={false}
                          className={`pp-pag-btn ${currentPage >= totalPages ? "disabled" : ""}`}
                        >
                          Sau →
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="pp-sidebar">
              <ProductSidebarFilters />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
