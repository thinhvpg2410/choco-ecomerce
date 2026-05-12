"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Loader2,
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
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminStatistics } from "@/services/admin.service";

const CHART_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#a855f7", // Violet
  "#f472b6", // Pink light
];

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

interface AdminStatistics {
  year: number;
  monthlyRevenue: Array<{
    month: number;
    revenue: number;
    orders: number;
  }>;
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
  categoryRevenue: Array<{
    name: string;
    revenue: number;
  }>;
  totals: {
    users: number;
    orders: number;
    products: number;
  };
}

export function Statistics() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error("Failed to load admin statistics", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const monthlyData = useMemo(() => {
    return (
      stats?.monthlyRevenue.map((item) => ({
        month: `T${item.month}`,
        revenue: item.revenue,
        orders: item.orders,
      })) ?? []
    );
  }, [stats]);

  const categoryData = useMemo(() => {
    const data = stats?.categoryRevenue ?? [];

    if (data.length <= 8) {
      return data.map((item) => ({
        name: item.name,
        value: item.revenue,
      }));
    }

    // Lấy Top 7 + Gom còn lại thành "Khác"
    const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
    const top7 = sorted.slice(0, 7);
    const othersRevenue = sorted
      .slice(7)
      .reduce((sum, item) => sum + item.revenue, 0);

    const result = top7.map((item) => ({
      name: item.name,
      value: item.revenue,
    }));

    if (othersRevenue > 0) {
      result.push({
        name: "Khác",
        value: othersRevenue,
      });
    }

    return result;
  }, [stats]);

  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = stats?.totals.orders ?? 0;
  const totalProducts = stats?.totals.products ?? 0;
  const totalUsers = stats?.totals.users ?? 0;

  const topByQuantity = stats?.topProductsByQuantity ?? [];
  const topByRevenue = stats?.topProductsByRevenue ?? [];

  return (
    <div className="space-y-6">
      {/* Thẻ tóm tắt - ĐÃ BỎ PHẦN % GIẢ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Doanh Thu",
            value: formatVND(totalRevenue),
            icon: DollarSign,
          },
          {
            label: "Đơn Hàng",
            value: totalOrders.toLocaleString(),
            icon: ShoppingCart,
          },
          {
            label: "Sản Phẩm",
            value: totalProducts.toLocaleString(),
            icon: Package,
          },
          {
            label: "Khách Hàng",
            value: totalUsers.toLocaleString(),
            icon: Users,
          },
        ].map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Năm {selectedYear}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Phần còn lại giữ nguyên */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Biểu đồ thống kê năm</h3>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
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

      {/* Doanh thu theo tháng */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Tháng — {selectedYear}</CardTitle>
          <CardDescription>
            Tổng doanh thu: {formatVND(totalRevenue)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}tr`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "revenue"
                      ? formatVND(value)
                      : value.toLocaleString(),
                    name === "revenue" ? "Doanh thu" : "Đơn hàng",
                  ]}
                />
                <Bar dataKey="revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" fill="#84c1f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Danh Mục</CardTitle>
          <CardDescription>
            Top 7 danh mục + Khác • Năm {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-muted-foreground">
              Chưa có dữ liệu danh mục trong năm {selectedYear}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={135}
                  paddingAngle={4}
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatVND(value), "Doanh thu"]}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Hai Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top sản phẩm bán chạy</CardTitle>
            <CardDescription>Theo số lượng bán ra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topByQuantity.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Chưa có dữ liệu
              </div>
            ) : (
              topByQuantity.slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border p-4"
                >
                  <div className="w-10 text-2xl font-black text-muted-foreground">
                    #{index + 1}
                  </div>
                  <img
                    src={item.image_url || "/placeholder.png"}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border"
                  />
                  <div className="flex-1">
                    <p className="font-semibold line-clamp-2">{item.name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {item.total_quantity} sản phẩm
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top sản phẩm doanh thu cao nhất</CardTitle>
            <CardDescription>Xếp hạng theo tổng doanh thu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topByRevenue.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Chưa có dữ liệu
              </div>
            ) : (
              topByRevenue.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border p-4"
                >
                  <div className="w-10 text-2xl font-black text-muted-foreground">
                    #{index + 1}
                  </div>
                  <img
                    src={item.image_url || "/placeholder.png"}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-2">{item.name}</p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{
                          width: `${(item.total_revenue / (topByRevenue[0]?.total_revenue || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatVND(item.total_revenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
