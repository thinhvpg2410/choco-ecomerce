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
import OrderDetailModal from "@/components/admin/OrderDetailModal"; // ← Đường dẫn modal
import { toast } from "sonner";
import { Search, Eye, Loader2 } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: any; color: string }> = {
  PENDING: { label: "Chờ xử lý", variant: "outline", color: "text-amber-600" },
  SHIPPING: { label: "Đang giao", variant: "default", color: "text-indigo-600" },
  DELIVERED: { label: "Đã giao", variant: "default", color: "text-green-600" },
  CANCELLED: { label: "Đã hủy", variant: "destructive", color: "text-red-600" },
};

const paymentConfig: Record<string, { label: string; variant: any }> = {
  PAID: { label: "Đã thanh toán", variant: "default" },
  PENDING: { label: "Chưa thanh toán", variant: "outline" },
};

export function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders({
        page: 1,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      const orderList = data?.data?.orders || data?.orders || [];
      setOrders(orderList);
    } catch (error: any) {
      console.error(error);
      toast.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter]);

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const handleStatusUpdated = () => {
    loadOrders(); // Refresh danh sách sau khi cập nhật
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Đơn Hàng</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {orders.length} đơn hàng · Doanh thu:{" "}
            <span className="font-semibold text-green-600">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Card
            key={key}
            className={`py-3 px-4 cursor-pointer transition-all ${
              statusFilter === key ? "ring-2 ring-primary" : "hover:shadow-md"
            }`}
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
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả đơn hàng</SelectItem>
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
            <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
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
                  {orders.map((order) => {
                    const status = statusConfig[order.status] ?? { label: order.status, variant: "outline" };
                    const payment = paymentConfig[order.paymentStatus ?? order.payment_status ?? ""] ?? { label: "N/A", variant: "outline" };

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            #{order.id?.slice(-8).toUpperCase()}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.receiverName || order.user?.email || "Không rõ"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {Number(order.finalAmount || order.final_amount || 0).toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.variant}>{payment.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.createdAt || order.created_at).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openOrderDetail(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
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

      {/* Modal Chi tiết */}
      <OrderDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        orderId={selectedOrderId}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}