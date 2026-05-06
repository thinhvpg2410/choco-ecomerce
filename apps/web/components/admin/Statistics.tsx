"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Package, Users, ShoppingCart, Loader2 } from "lucide-react";
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

const categoryData = [
  { name: "Chocolate đen", value: 400, color: "#3b1f0a" },
  { name: "Chocolate sữa", value: 320, color: "#8b5e3c" },
  { name: "Chocolate trắng", value: 200, color: "#f5deb3" },
  { name: "Kẹo", value: 150, color: "#e8a87c" },
  { name: "Bánh", value: 130, color: "#c0765a" },
];

const CHART_COLORS = [
  "#1e3a5f",
  "#2d6a9f",
  "#3d8bcd",
  "#5ba4e0",
  "#84c1f0",
  "#a8d8f0",
  "#c4e8ff",
  "#d8f0ff",
  "#e8f7ff",
  "#f0fbff",
];

interface AdminStatistics {
  year: number;
  monthlyRevenue: Array<{ month: number; revenue: number; orders: number }>;
  topProductsByQuantity: Array<{ name: string; total_quantity: number }>;
  topProductsByRevenue: Array<{ name: string; total_revenue: number }>;
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

  const monthlyData =
    stats?.monthlyRevenue.map((item) => ({
      month: `T${item.month}`,
      revenue: item.revenue,
      orders: item.orders,
    })) ?? [];

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = stats?.totals.orders ?? 0;
  const totalProducts = stats?.totals.products ?? 0;
  const totalUsers = stats?.totals.users ?? 0;
  const topByQuantity = stats?.topProductsByQuantity ?? [];
  const topByRevenue = stats?.topProductsByRevenue ?? [];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Doanh Thu",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            delta: "+18.2%",
          },
          {
            label: "Đơn Hàng",
            value: totalOrders.toLocaleString(),
            icon: ShoppingCart,
            delta: "+12.5%",
          },
          {
            label: "Sản Phẩm",
            value: totalProducts.toLocaleString(),
            icon: Package,
            delta: "+3.1%",
          },
          {
            label: "Khách Hàng",
            value: totalUsers.toLocaleString(),
            icon: Users,
            delta: "+8.2%",
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
              <p className="text-xs text-green-600 mt-1 font-medium">
                {card.delta} so với năm trước
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Tháng — {selectedYear}</CardTitle>
          <CardDescription>
            Tổng doanh thu: ${totalRevenue.toLocaleString()}
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
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === "revenue"
                      ? `$${Number(value || 0).toLocaleString()}`
                      : value,
                    name === "revenue" ? "Doanh thu" : "Đơn hàng",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#1e3a5f"
                  radius={[4, 4, 0, 0]}
                  name="revenue"
                />
                <Bar
                  dataKey="orders"
                  fill="#84c1f0"
                  radius={[4, 4, 0, 0]}
                  name="orders"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doanh Số Theo Danh Mục</CardTitle>
          <CardDescription>Phân bổ doanh số theo loại sản phẩm</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                labelLine
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v} đơn vị`, "Số lượng"]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top sản phẩm theo số lượng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topByQuantity.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              Chưa có dữ liệu thống kê
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {topByQuantity.map((item, index) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">#{index + 1}</p>
                    <Badge variant="secondary">{item.total_quantity} sp</Badge>
                  </div>
                  <p className="mt-3 text-base font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tổng sản phẩm bán ra
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top sản phẩm theo doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {topByRevenue.map((item, index) => (
              <div
                key={item.name}
                className="rounded-2xl border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">#{index + 1}</p>
                  <Badge variant="secondary">
                    ${item.total_revenue.toLocaleString()}
                  </Badge>
                </div>
                <p className="mt-3 text-base font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tổng doanh thu
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
