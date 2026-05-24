"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Loader2,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAdminStatistics } from "@/services/admin.service";

const PIE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#a855f7",
  "#06b6d4",
];

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

const formatVNDShort = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
};

interface AdminStatistics {
  year: number;
  monthlyRevenue: Array<{ month: number; revenue: number; orders: number }>;
  topProductsByQuantity: Array<{
    name: string;
    image_url: string;
    total_quantity: number;
  }>;
  topProductsByRevenue: Array<{
    name: string;
    image_url: string;
    total_revenue: number;
  }>;
  categoryRevenue: Array<{ name: string; revenue: number }>;
  totals: { users: number; orders: number; products: number };
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border/60 bg-background/98 backdrop-blur-sm px-4 py-3 shadow-2xl text-sm min-w-[180px]">
      <p className="font-bold text-foreground mb-2 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: p.fill }}
            />
            {p.dataKey === "revenue" ? "Doanh thu" : "Đơn hàng"}
          </span>
          <span className="font-bold text-foreground text-xs">
            {p.dataKey === "revenue"
              ? formatVND(p.value)
              : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border/60 bg-background/98 backdrop-blur-sm px-4 py-3 shadow-2xl text-sm">
      <p className="font-semibold text-foreground text-xs mb-1">
        {payload[0].name}
      </p>
      <p className="font-bold text-base" style={{ color: payload[0].fill }}>
        {formatVND(payload[0].value)}
      </p>
    </div>
  );
};

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

export function Statistics() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeBar, setActiveBar] = useState<string | null>(null);

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => (currentYear - i).toString()),
    [currentYear],
  );

  useEffect(() => {
    loadStatistics();
  }, [selectedYear]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await getAdminStatistics(Number(selectedYear));
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = useMemo(
    () =>
      stats?.monthlyRevenue.map((item) => ({
        month: `T${item.month}`,
        revenue: item.revenue,
        orders: item.orders,
      })) ?? [],
    [stats],
  );

  const categoryData = useMemo(() => {
    const data = stats?.categoryRevenue ?? [];
    const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
    if (sorted.length <= 8)
      return sorted.map((item) => ({ name: item.name, value: item.revenue }));
    const top7 = sorted
      .slice(0, 7)
      .map((item) => ({ name: item.name, value: item.revenue }));
    const othersRevenue = sorted
      .slice(7)
      .reduce((sum, item) => sum + item.revenue, 0);
    if (othersRevenue > 0) top7.push({ name: "Khác", value: othersRevenue });
    return top7;
  }, [stats]);

  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, item) => sum + item.orders, 0);
  const topByQuantity = stats?.topProductsByQuantity ?? [];
  const topByRevenue = stats?.topProductsByRevenue ?? [];

  const summaryCards = [
    {
      label: "Doanh thu năm",
      value: formatVND(totalRevenue),
      subValue: `${totalOrders} đơn đã giao`,
      icon: DollarSign,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      accent: "border-l-blue-500",
    },
    {
      label: "Tổng đơn hàng",
      value: (stats?.totals.orders ?? 0).toLocaleString(),
      subValue: "Tất cả trạng thái",
      icon: ShoppingCart,
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      accent: "border-l-violet-500",
    },
    {
      label: "Sản phẩm",
      value: (stats?.totals.products ?? 0).toLocaleString(),
      subValue: "Đang kinh doanh",
      icon: Package,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      accent: "border-l-orange-500",
    },
    {
      label: "Khách hàng",
      value: (stats?.totals.users ?? 0).toLocaleString(),
      subValue: "Đã đăng ký",
      icon: Users,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accent: "border-l-emerald-500",
    },
  ];

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-muted rounded-xl ${className}`} />
  );

  return (
    <div className="space-y-8 pb-8">
      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Admin
          </p>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            Thống kê
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Năm</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28 h-9 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`relative rounded-2xl bg-background border border-border/60 border-l-4 ${card.accent} p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
            >
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                {card.label}
              </p>
              {loading ? (
                <Skeleton className="h-7 w-28 mt-1" />
              ) : (
                <p className="text-xl font-black text-foreground tracking-tight mt-0.5">
                  {card.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.subValue}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Monthly Revenue Chart ── */}
      <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-border/40">
          <div>
            <h3 className="font-bold text-foreground">Doanh thu theo tháng</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Năm {selectedYear} ·{" "}
              <span className="font-semibold text-foreground">
                {formatVND(totalRevenue)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ background: "#4f46e5" }}
              />
              Doanh thu
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ background: "#a5b4fc" }}
              />
              Đơn hàng
            </span>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={monthlyData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="hsl(var(--border))"
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="rev"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={formatVNDShort}
                  axisLine={false}
                  tickLine={false}
                  width={46}
                />
                <YAxis
                  yAxisId="ord"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{
                    fill: "hsl(var(--muted))",
                    radius: 8,
                    opacity: 0.5,
                  }}
                />
                <Bar
                  yAxisId="rev"
                  dataKey="revenue"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  yAxisId="ord"
                  dataKey="orders"
                  fill="#a5b4fc"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Category Pie + Top Products grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-border/40">
            <h3 className="font-bold text-foreground">
              Doanh thu theo danh mục
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top 7 danh mục · {selectedYear}
            </p>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              </div>
            ) : categoryData.length === 0 ? (
              <div className="flex flex-col h-72 items-center justify-center text-muted-foreground gap-2">
                <BarChart2 className="w-10 h-10 opacity-20" />
                <p className="text-sm">Chưa có dữ liệu năm {selectedYear}</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={100}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 px-1">
                  {categoryData.map((item, index) => {
                    const pct =
                      totalRevenue > 0
                        ? ((item.value / totalRevenue) * 100).toFixed(1)
                        : "0";
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            background: PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-xs text-muted-foreground truncate flex-1">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-foreground flex-shrink-0">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top sản phẩm bán chạy */}
        <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-border/40">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Top sản phẩm bán chạy
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo số lượng · {selectedYear}
            </p>
          </div>
          <div className="divide-y divide-border/40">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : topByQuantity.length === 0 ? (
              <div className="flex flex-col h-48 items-center justify-center text-muted-foreground gap-2">
                <Package className="w-8 h-8 opacity-20" />
                <p className="text-sm">Chưa có dữ liệu</p>
              </div>
            ) : (
              topByQuantity.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-lg w-7 text-center flex-shrink-0">
                    {MEDAL[index] ?? `#${index + 1}`}
                  </span>
                  <img
                    src={item.image_url || "/placeholder.png"}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover border border-border/50 flex-shrink-0"
                  />
                  <p className="flex-1 text-sm font-medium text-foreground line-clamp-2 leading-snug">
                    {item.name}
                  </p>
                  <Badge
                    variant="secondary"
                    className="font-bold flex-shrink-0 tabular-nums"
                  >
                    {item.total_quantity}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Top Revenue Products ── */}
      <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-border/40">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            Top sản phẩm doanh thu cao nhất
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xếp hạng theo tổng doanh thu · {selectedYear}
          </p>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : topByRevenue.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center text-muted-foreground gap-2">
            <DollarSign className="w-8 h-8 opacity-20" />
            <p className="text-sm">Chưa có dữ liệu</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {topByRevenue.map((item, index) => {
              const pct =
                (item.total_revenue / (topByRevenue[0]?.total_revenue || 1)) *
                100;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-lg w-7 text-center flex-shrink-0">
                    {MEDAL[index] ?? `#${index + 1}`}
                  </span>
                  <img
                    src={item.image_url || "/placeholder.png"}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover border border-border/50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1 mb-2">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, #4f46e5, #818cf8)`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-foreground flex-shrink-0 tabular-nums">
                    {formatVND(item.total_revenue)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
