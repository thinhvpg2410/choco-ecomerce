"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAdminOrders } from "@/services/admin.service";
import type { Order } from "@/types/type";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";


const statusConfig: Record<
  string,
  { label: string; variant: any; color: string }
> = {
  PENDING: { label: "Chờ xử lý", variant: "outline", color: "text-amber-600" },
  PROCESSING: {
    label: "Đang xử lý",
    variant: "secondary",
    color: "text-blue-600",
  },
  SHIPPING: {
    label: "Đang giao",
    variant: "default",
    color: "text-indigo-600",
  },
  DELIVERED: { label: "Đã giao", variant: "default", color: "text-green-600" },
  CANCELLED: { label: "Đã hủy", variant: "destructive", color: "text-red-600" },
};

const paymentConfig: Record<string, { label: string; variant: any }> = {
  PAID: { label: "Đã thanh toán", variant: "default" },
  UNPAID: { label: "Chưa thanh toán", variant: "outline" },
  REFUNDED: { label: "Đã hoàn tiền", variant: "secondary" },
};

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders({
        page: 1,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      setOrders(data.orders ?? []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const userDisplay =
      (o as any).user?.email || (o as any).user?.username || o.user_id || "";
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      userDisplay.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (o.final_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Đơn Hàng</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {orders.length} đơn hàng · Doanh thu: $
            {totalRevenue.toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Card
            key={key}
            className={`py-3 px-4 cursor-pointer transition-all ${statusFilter === key ? "ring-2 ring-primary" : "hover:shadow-md"}`}
            onClick={() => setStatusFilter(statusFilter === key ? "ALL" : key)}
          >
            <p className="text-xs text-muted-foreground">{cfg.label}</p>
            <p className={`text-2xl font-bold mt-1 ${cfg.color}`}>
              {orders.filter((o) => o.status === key).length}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadOrders()}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy đơn hàng nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => {
                    const status = statusConfig[order.status] ?? {
                      label: order.status,
                      variant: "outline",
                      color: "",
                    };
                    const payment = paymentConfig[
                      order.payment_status ?? ""
                    ] ?? {
                      label: order.payment_status ?? "N/A",
                      variant: "outline",
                    };
                    return (
                      <TableRow
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            #{order.id.slice(-8).toUpperCase()}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(order as any).user?.email ||
                            (order as any).user?.username ||
                            order.user_id ||
                            "Không rõ"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${order.final_amount?.toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.variant} className="text-xs">
                            {payment.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Xem
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                            >
                              Cập nhật
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
