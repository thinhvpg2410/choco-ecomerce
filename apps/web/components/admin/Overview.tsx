"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { getAdminStatistics } from "@/services/admin.service";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export function Overview() {
  const [data, setData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getAdminStatistics(new Date().getFullYear()).then(setData);
  }, []);

  const totals = data?.totals || { users: 0, orders: 0, products: 0 };
  const revenue =
    data?.monthlyRevenue?.reduce((sum: number, m: any) => sum + m.revenue, 0) ||
    0;

  const cards = [
    {
      label: "Doanh thu năm",
      value: formatVND(revenue),
      sub: "Tổng doanh thu",
      icon: DollarSign,
      accent: "#22d3ee",
      glow: "rgba(34,211,238,0.25)",
      bar: "from-cyan-400 to-blue-500",
    },
    {
      label: "Đơn hàng",
      value: totals.orders.toLocaleString(),
      sub: "Tổng đơn",
      icon: ShoppingCart,
      accent: "#a78bfa",
      glow: "rgba(167,139,250,0.25)",
      bar: "from-violet-400 to-purple-600",
    },
    {
      label: "Sản phẩm",
      value: totals.products.toLocaleString(),
      sub: "Đang kinh doanh",
      icon: Package,
      accent: "#fb923c",
      glow: "rgba(251,146,60,0.25)",
      bar: "from-orange-400 to-rose-500",
    },
    {
      label: "Khách hàng",
      value: totals.users.toLocaleString(),
      sub: "Đã đăng ký",
      icon: Users,
      accent: "#4ade80",
      glow: "rgba(74,222,128,0.25)",
      bar: "from-green-400 to-emerald-500",
    },
  ];

  return (
    <div
      className="space-y-8"
      style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}
    >
      {/* ── HERO ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow blobs */}
        <div
          className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #3b82f6, transparent)",
          }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent)",
          }}
        />

        <div className="relative p-8 md:p-10">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(34,211,238,0.15)",
                    color: "#22d3ee",
                    border: "1px solid rgba(34,211,238,0.3)",
                  }}
                >
                  <TrendingUp className="w-3 h-3" />
                  LIVE
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-black text-white tracking-tight"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Dashboard Quản Trị
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                Tổng quan hoạt động kinh doanh — {new Date().getFullYear()}
              </p>
            </div>

            <div
              className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              <img
                src="/ChocoKingdom_Logo.jpg"
                alt="logo"
                className="w-full h-full object-contain p-2"
              />
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
              <div
                key={i}
                className="group relative rounded-xl p-5 overflow-hidden cursor-default"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  animationDelay: `${i * 80}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 20px 40px ${card.glow}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* accent line top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${card.accent}18`,
                      border: `1px solid ${card.accent}30`,
                    }}
                  >
                    <card.icon
                      className="w-5 h-5"
                      style={{ color: card.accent }}
                    />
                  </div>
                  <ArrowUpRight
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: card.accent }}
                  />
                </div>

                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p
                  className="text-white text-2xl font-black tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {card.value}
                </p>
                <p className="text-slate-500 text-xs mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick tip */}
      <p className="text-xs text-center text-muted-foreground">
        Dữ liệu được cập nhật theo thời gian thực • Xem chi tiết tại tab{" "}
        <span className="font-semibold text-foreground">Thống kê</span>
      </p>
    </div>
  );
}
