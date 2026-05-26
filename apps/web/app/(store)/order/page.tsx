"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders } from "@/services/order.service";
import type { OrderApiResponse } from "@/services/order.service";
import {
  Loader2,
  Package,
  ChevronRight,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  MapPin,
  Hash,
  ChevronLeft,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

type StatusKey = "ALL" | "PENDING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

const PAGE_SIZE = 10;

const TABS: { key: StatusKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "ALL",
    label: "Tất cả",
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
  },
  {
    key: "PENDING",
    label: "Chờ xử lý",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    key: "SHIPPING",
    label: "Đang giao",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  {
    key: "DELIVERED",
    label: "Đã nhận",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  {
    key: "CANCELLED",
    label: "Đã huỷ",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
];

const STATUS_CFG: Record<
  string,
  { label: string; pillBg: string; pillText: string; dotBg: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    pillBg: "#FFF7ED",
    pillText: "#C2410C",
    dotBg: "#FB923C",
  },
  SHIPPING: {
    label: "Đang giao",
    pillBg: "#EFF6FF",
    pillText: "#1D4ED8",
    dotBg: "#60A5FA",
  },
  DELIVERED: {
    label: "Đã nhận",
    pillBg: "#F0FDF4",
    pillText: "#15803D",
    dotBg: "#4ADE80",
  },
  CANCELLED: {
    label: "Đã huỷ",
    pillBg: "#FFF1F2",
    pillText: "#BE123C",
    dotBg: "#FB7185",
  },
};

const PAYMENT_CFG: Record<
  string,
  { label: string; pillBg: string; pillText: string }
> = {
  PENDING: { label: "Chưa thanh toán", pillBg: "#FFFBEB", pillText: "#92400E" },
  PAID: { label: "Đã thanh toán", pillBg: "#F0FDFA", pillText: "#0F766E" },
};

const fmt = (v: number) => v.toLocaleString("vi-VN") + "đ";
const fmtDate = (v: string) =>
  new Date(v).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const fmtTime = (v: string) =>
  new Date(v).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusKey>("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await getMyOrders());
      } catch (err) {
        console.error("Get orders failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // reset về trang 1 khi đổi tab
  const handleTab = (key: StatusKey) => {
    setActiveTab(key);
    setPage(1);
  };

  const filtered =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const countFor = (k: StatusKey) =>
    k === "ALL" ? orders.length : orders.filter((o) => o.status === k).length;

  if (loading) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "#F8FAFC",
          }}
        >
          <Loader2
            style={{
              width: 32,
              height: 32,
              color: "#E11D48",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
            Đang tải đơn hàng…
          </p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .op-root { font-family: 'Inter', sans-serif; min-height: 100vh; background: #F1F5F9; padding: 32px 16px 64px; }

        /* ── tabs ── */
        .op-tabs { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
        .op-tabs::-webkit-scrollbar { display: none; }
        .op-tab {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
          border: none; cursor: pointer; white-space: nowrap; transition: all .18s;
          background: transparent; color: #64748B;
        }
        .op-tab:hover { background: #E2E8F0; color: #1E293B; }
        .op-tab.active { background: #E11D48; color: #fff; box-shadow: 0 4px 12px rgba(225,29,72,.28); }
        .op-tab-badge {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 20px; height: 18px; border-radius: 999px; padding: 0 5px;
          font-size: 11px; font-weight: 700;
          background: rgba(255,255,255,.22); color: inherit;
        }
        .op-tab:not(.active) .op-tab-badge { background: #F1F5F9; color: #E11D48; }

        /* ── card ── */
        .op-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          overflow: hidden;
          transition: box-shadow .2s, transform .2s;
          animation: opFadeUp .3s ease both;
        }
        .op-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.1); transform: translateY(-2px); }
        .op-card:hover .op-arrow { transform: translateX(3px); }
        .op-arrow { transition: transform .18s; }

        @keyframes opFadeUp {
          from { opacity:0; transform: translateY(12px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .op-card:nth-child(1)  { animation-delay: .03s }
        .op-card:nth-child(2)  { animation-delay: .06s }
        .op-card:nth-child(3)  { animation-delay: .09s }
        .op-card:nth-child(4)  { animation-delay: .12s }
        .op-card:nth-child(5)  { animation-delay: .15s }
        .op-card:nth-child(6)  { animation-delay: .18s }
        .op-card:nth-child(7)  { animation-delay: .21s }
        .op-card:nth-child(8)  { animation-delay: .24s }
        .op-card:nth-child(9)  { animation-delay: .27s }
        .op-card:nth-child(10) { animation-delay: .30s }

        /* ── pill ── */
        .op-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 600;
          border: 1px solid transparent;
        }
        .op-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        /* ── thumb ── */
        .op-thumb {
          width: 52px; height: 52px; border-radius: 12px; object-fit: cover;
          border: 1.5px solid #F1F5F9; flex-shrink: 0; background: #F8FAFC;
        }
        .op-thumb-extra {
          width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0;
          background: #F1F5F9; border: 1.5px solid #E2E8F0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #64748B;
        }

        /* ── divider ── */
        .op-divider { height: 1px; background: #F1F5F9; margin: 14px 0; }

        /* ── meta row ── */
        .op-meta { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #94A3B8; }
        .op-meta svg { flex-shrink: 0; }

        /* ── detail link ── */
        .op-link {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 13px; font-weight: 600; color: #E11D48;
          text-decoration: none; padding: 6px 14px; border-radius: 8px;
          background: #FFF1F2; transition: background .15s;
        }
        .op-link:hover { background: #FFE4E6; }

        /* ── progress bar ── */
        .op-progress-track { height: 3px; background: #F1F5F9; }
        .op-progress-fill  { height: 100%; border-radius: 0 3px 3px 0; }

        /* ── empty ── */
        .op-empty {
          background: #fff; border-radius: 16px; border: 1.5px dashed #E2E8F0;
          padding: 56px 24px; text-align: center;
        }
        .op-empty-icon {
          width: 68px; height: 68px; border-radius: 50%; background: #FFF1F2;
          margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;
        }

        /* ── pagination ── */
        .op-pg-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 8px; font-size: 13px; font-weight: 600;
          border: 1.5px solid #E2E8F0; background: #fff; color: #475569; cursor: pointer;
          transition: all .15s;
        }
        .op-pg-btn:hover:not(:disabled) { border-color: #E11D48; color: #E11D48; }
        .op-pg-btn.active { background: #E11D48; border-color: #E11D48; color: #fff; }
        .op-pg-btn:disabled { opacity: .4; cursor: not-allowed; }

        /* ── shop btn ── */
        .op-shop-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
          border: 1.5px solid #E2E8F0; background: #fff; color: #475569;
          text-decoration: none; cursor: pointer; transition: all .15s;
        }
        .op-shop-btn:hover { border-color: #CBD5E1; background: #F8FAFC; color: #1E293B; }

        .op-cta {
          background: #E11D48; color: #fff; border: none;
          padding: 10px 28px; border-radius: 10px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: background .15s;
          box-shadow: 0 4px 12px rgba(225,29,72,.28);
        }
        .op-cta:hover { background: #BE123C; }
      `}</style>

      <div className="op-root">
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Đơn hàng của tôi
              </h1>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "#94A3B8",
                  fontWeight: 500,
                }}
              >
                {orders.length} đơn · theo dõi trạng thái giao hàng
              </p>
            </div>
            <Link href="/" className="op-shop-btn">
              <ShoppingBag style={{ width: 15, height: 15 }} />
              Mua sắm
            </Link>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "6px",
              marginBottom: 20,
              boxShadow: "0 1px 4px rgba(0,0,0,.05)",
            }}
          >
            <div className="op-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`op-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => handleTab(tab.key)}
                >
                  {tab.icon}
                  {tab.label}
                  <span className="op-tab-badge">{countFor(tab.key)}</span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="op-empty">
              <div className="op-empty-icon">
                <Package style={{ width: 30, height: 30, color: "#E11D48" }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                {activeTab === "ALL"
                  ? "Bạn chưa có đơn hàng nào"
                  : `Không có đơn "${TABS.find((t) => t.key === activeTab)?.label}"`}
              </p>
              <p style={{ marginTop: 6, fontSize: 13, color: "#94A3B8" }}>
                {activeTab === "ALL"
                  ? "Hãy mua sắm để tạo đơn hàng đầu tiên."
                  : "Thử xem tab khác hoặc đặt thêm đơn mới."}
              </p>
              <button
                className="op-cta"
                style={{ marginTop: 24 }}
                onClick={() => (window.location.href = "/")}
              >
                Mua sắm ngay
              </button>
            </div>
          ) : (
            <>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {paginated.map((order) => {
                  const sCfg = STATUS_CFG[order.status] ?? {
                    label: order.status,
                    pillBg: "#F1F5F9",
                    pillText: "#475569",
                    dotBg: "#94A3B8",
                  };
                  const pCfg = PAYMENT_CFG[
                    order.payment_status ?? "PENDING"
                  ] ?? {
                    label: order.payment_status,
                    pillBg: "#F1F5F9",
                    pillText: "#475569",
                  };
                  const thumbs = order.items?.slice(0, 3) ?? [];
                  const extraCount = Math.max(
                    0,
                    (order.items?.length ?? 0) - 3,
                  );
                  const firstItem = order.items?.[0];

                  return (
                    <div key={order.id} className="op-card">
                      <div style={{ padding: "18px 20px" }}>
                        {/* Row 1 — ID / date / badges */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div className="op-meta">
                              <Hash style={{ width: 12, height: 12 }} />
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "#334155",
                                  fontSize: 13,
                                  letterSpacing: ".04em",
                                }}
                              >
                                {order.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                            <div className="op-meta">
                              <Clock style={{ width: 12, height: 12 }} />
                              <span>{fmtDate(order.createdAt)}</span>
                              <span style={{ color: "#E2E8F0" }}>·</span>
                              <span>{fmtTime(order.createdAt)}</span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 6,
                            }}
                          >
                            <span
                              className="op-pill"
                              style={{
                                background: sCfg.pillBg,
                                color: sCfg.pillText,
                                borderColor: sCfg.pillBg,
                              }}
                            >
                              <span
                                className="op-dot"
                                style={{ background: sCfg.dotBg }}
                              />
                              {sCfg.label}
                            </span>
                            <span
                              className="op-pill"
                              style={{
                                background: pCfg.pillBg,
                                color: pCfg.pillText,
                                borderColor: pCfg.pillBg,
                              }}
                            >
                              <CreditCard style={{ width: 11, height: 11 }} />
                              {pCfg.label}
                            </span>
                          </div>
                        </div>

                        <div className="op-divider" />

                        {/* Row 2 — Thumbs + product name */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{ display: "flex", gap: 6, flexShrink: 0 }}
                          >
                            {thumbs.map((item, i) => (
                              <img
                                key={i}
                                src={item.image}
                                alt={item.name}
                                className="op-thumb"
                              />
                            ))}
                            {extraCount > 0 && (
                              <div className="op-thumb-extra">
                                +{extraCount}
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#0F172A",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {firstItem?.name}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#94A3B8",
                                marginTop: 3,
                              }}
                            >
                              {order.items.length} sản phẩm
                            </p>
                          </div>
                        </div>

                        <div className="op-divider" />

                        {/* Row 3 — Total + address + link */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 20,
                                fontWeight: 800,
                                color: "#E11D48",
                                lineHeight: 1,
                              }}
                            >
                              {fmt(order.total_amount)}
                            </p>
                            {order.shipping_address && (
                              <div
                                className="op-meta"
                                style={{ maxWidth: 260 }}
                              >
                                <MapPin
                                  style={{
                                    width: 11,
                                    height: 11,
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {order.shipping_address}
                                </span>
                              </div>
                            )}
                          </div>
                          <Link href={`/order/${order.id}`} className="op-link">
                            Xem chi tiết
                            <ChevronRight
                              className="op-arrow"
                              style={{ width: 15, height: 15 }}
                            />
                          </Link>
                        </div>
                      </div>

                      {/* Progress strip */}
                      {order.status === "SHIPPING" && (
                        <div className="op-progress-track">
                          <div
                            className="op-progress-fill"
                            style={{
                              width: "60%",
                              background:
                                "linear-gradient(90deg,#E11D48,#F59E0B)",
                            }}
                          />
                        </div>
                      )}
                      {order.status === "DELIVERED" && (
                        <div className="op-progress-track">
                          <div
                            className="op-progress-fill"
                            style={{ width: "100%", background: "#22C55E" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 28,
                  }}
                >
                  <button
                    className="op-pg-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Trang trước"
                  >
                    <ChevronLeft style={{ width: 16, height: 16 }} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`op-pg-btn ${p === page ? "active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    className="op-pg-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Trang sau"
                  >
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              )}

              {/* ── Page info ── */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#94A3B8",
                  marginTop: 10,
                }}
              >
                Hiển thị {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} /{" "}
                {filtered.length} đơn hàng
              </p>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
