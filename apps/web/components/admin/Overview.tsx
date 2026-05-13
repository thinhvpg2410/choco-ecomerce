"use client";

import { useEffect, useState } from "react";
import { DollarSign, Package, Users, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAdminStatistics } from "@/services/admin.service";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export function Overview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAdminStatistics(new Date().getFullYear()).then(setData);
  }, []);

  const totals = data?.totals || {
    users: 0,
    orders: 0,
    products: 0,
  };

  const revenue =
    data?.monthlyRevenue?.reduce((sum: number, m: any) => sum + m.revenue, 0) ||
    0;

  const cards = [
    {
      label: "Doanh thu",
      value: formatVND(revenue),
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      label: "Đơn hàng",
      value: totals.orders.toLocaleString(),
      icon: ShoppingCart,
      gradient: "from-purple-500 to-pink-400",
    },
    {
      label: "Sản phẩm",
      value: totals.products.toLocaleString(),
      icon: Package,
      gradient: "from-orange-400 to-yellow-300",
    },
    {
      label: "Khách hàng",
      value: totals.users.toLocaleString(),
      icon: Users,
      gradient: "from-green-400 to-emerald-300",
    },
  ];

  return (
    <div className="space-y-10">
      {/* HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
        {/* background blur circles */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
          {/* left */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">
              Dashboard Tổng Quan
            </h1>
            <p className="text-white/70">
              Theo dõi doanh thu, đơn hàng và tăng trưởng hệ thống
            </p>
          </div>

          {/* center image */}
          <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-105 transition">
            <img
              src="/ChocoKingdom_Logo.jpg"
              alt="dashboard"
              className="w-30 h-30 object-contain"
            />
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
          {cards.map((item, i) => (
            <Card
              key={i}
              className="group relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl hover:scale-[1.05] transition-all duration-300"
            >
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r ${item.gradient}`}
              />

              <div className="relative p-5">
                <item.icon className="w-5 h-5 text-white/80 mb-2" />
                <p className="text-sm text-white/70">{item.label}</p>
                <p className="text-xl font-bold text-white mt-1">
                  {item.value}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
