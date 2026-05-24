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
import { OrderDetailModal } from "./OrderDetailModal";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Loader2,
  TrendingUp,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: any;
    color: string;
    bg: string;
    icon: any;
    ring: string;
  }
> = {
  PENDING: {
    label: "Chờ xử lý",
    variant: "outline",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: Clock,
    ring: "ring-amber-400",
  },
  SHIPPING: {
    label: "Đang giao",
    variant: "default",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Truck,
    ring: "ring-blue-400",
  },
  DELIVERED: {
    label: "Đã giao",
    variant: "default",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: CheckCircle2,
    ring: "ring-emerald-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    variant: "destructive",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: XCircle,
    ring: "ring-red-400",
  },
};

const paymentConfig: Record<
  string,
  { label: string; variant: any; color: string; bg: string }
> = {
  PAID: {
    label: "Đã thanh toán",
    variant: "default",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  PENDING: {
    label: "Chưa thanh toán",
    variant: "outline",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
};

export function OrdersManagement() {
  const [allOrders, setAllOrders] = useState<any[]>([]); // cho stat cards
  const [orders, setOrders] = useState<any[]>([]); // cho table
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [open, setOpen] = useState(false);

  // Luôn fetch ALL để tính stats cards đúng
  const loadAllOrders = async () => {
    try {
      const data = await getAdminOrders({ page: 1 });
      const list = data?.data?.orders ?? data?.orders ?? [];
      setAllOrders(list);
    } catch {
      // silent
    }
  };

  // Fetch có filter cho table
  const loadOrders = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getAdminOrders({
        page: 1,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });
      const list = data?.data?.orders ?? data?.orders ?? [];
      setOrders(list);
    } catch {
      toast.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllOrders();
  }, []); // mount 1 lần

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => loadOrders(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleCloseModal = () => {
    setOpen(false);
    loadOrders(true);
    loadAllOrders();
  };

  const totalRevenue = allOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + (Number(o.finalAmount) || 0), 0);

  const pendingCount = allOrders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-6 p-1">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý đơn hàng
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {orders.length} đơn hàng ·{" "}
            <span className="font-semibold text-emerald-600">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </span>{" "}
            doanh thu
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-semibold">
                · <Clock className="w-3.5 h-3.5" /> {pendingCount} chờ duyệt
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 self-start"
          onClick={() => loadOrders(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = allOrders.filter((o) => o.status === key).length;
          const active = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(active ? "ALL" : key)}
              className={`
                group relative text-left rounded-xl border p-4 transition-all duration-150
                ${
                  active
                    ? `ring-2 ${cfg.ring} border-transparent shadow-md`
                    : "border-border hover:shadow-md hover:border-border/80"
                }
                ${cfg.bg}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {cfg.label}
                  </p>
                  <p
                    className={`text-3xl font-black mt-1 tabular-nums ${cfg.color}`}
                  >
                    {count}
                  </p>
                </div>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg} border border-white/60`}
                >
                  <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                </div>
              </div>
              {active && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl bg-current opacity-30" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn, tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="Lọc trạng thái" />
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

      {/* ── TABLE ── */}
      <Card className="overflow-hidden border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Đang tải đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <Package className="h-10 w-10 opacity-30" />
              <p className="text-sm">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-36 font-semibold">Mã đơn</TableHead>
                    <TableHead className="font-semibold">Khách hàng</TableHead>
                    <TableHead className="font-semibold">Sản phẩm</TableHead>
                    <TableHead className="text-right font-semibold">
                      Tổng tiền
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Đơn hàng
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Thanh toán
                    </TableHead>
                    <TableHead className="font-semibold">Ngày tạo</TableHead>
                    <TableHead className="text-right font-semibold">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const status = statusConfig[order.status] ?? {
                      label: order.status,
                      variant: "outline",
                      color: "",
                      bg: "",
                    };
                    const payment = paymentConfig[
                      order.paymentStatus ?? order.payment_status ?? ""
                    ] ?? {
                      label: "N/A",
                      variant: "outline",
                      color: "",
                      bg: "",
                    };
                    const isPending = order.status === "PENDING";

                    return (
                      <TableRow
                        key={order.id}
                        className={`
                          transition-colors hover:bg-muted/30
                          ${isPending ? "border-l-2 border-l-amber-400" : ""}
                        `}
                      >
                        {/* Mã đơn */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <code className="text-[11px] bg-muted px-2 py-1 rounded font-mono font-semibold w-fit">
                              #{order.id?.slice(-8).toUpperCase()}
                            </code>
                            {isPending && (
                              <span className="text-[10px] text-amber-600 font-medium">
                                ● Chờ duyệt
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Khách hàng */}
                        <TableCell>
                          <p className="font-medium text-sm leading-tight">
                            {order.receiverName ||
                              order.user?.username ||
                              "Không rõ"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.receiverPhone || order.user?.email}
                          </p>
                        </TableCell>

                        {/* Sản phẩm */}
                        <TableCell>
                          <div className="flex -space-x-2">
                            {order.items
                              ?.slice(0, 3)
                              .map((item: any, i: number) => (
                                <img
                                  key={i}
                                  src={item.productImageAtTime || item.image}
                                  alt={item.productNameAtTime}
                                  className="w-8 h-8 rounded-lg border-2 border-white object-cover"
                                />
                              ))}
                            {(order.items?.length ?? 0) > 3 && (
                              <div className="w-8 h-8 rounded-lg border-2 border-white bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.items?.length ?? 0} sản phẩm
                          </p>
                        </TableCell>

                        {/* Tổng tiền */}
                        <TableCell className="text-right">
                          <p className="font-bold text-sm tabular-nums">
                            {Number(order.finalAmount || 0).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.paymentMethod}
                          </p>
                        </TableCell>

                        {/* Trạng thái đơn */}
                        <TableCell className="text-center">
                          <span
                            className={`
                            inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full
                            ${status.bg} ${status.color}
                          `}
                          >
                            {status.label}
                          </span>
                        </TableCell>

                        {/* Trạng thái thanh toán */}
                        <TableCell className="text-center">
                          <span
                            className={`
                            inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full
                            ${payment.bg} ${payment.color}
                          `}
                          >
                            {payment.label}
                          </span>
                        </TableCell>

                        {/* Ngày tạo */}
                        <TableCell>
                          <p className="text-sm tabular-nums">
                            {new Date(
                              order.createdAt || order.created_at,
                            ).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              order.createdAt || order.created_at,
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </TableCell>

                        {/* Thao tác */}
                        <TableCell className="text-right">
                          <Button
                            variant={isPending ? "default" : "outline"}
                            size="sm"
                            className={`h-8 px-3 gap-1.5 text-xs font-semibold ${
                              isPending
                                ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {isPending ? "Duyệt ngay" : "Xem"}
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

      <OrderDetailModal
        open={open}
        onOpenChange={(v) => {
          if (!v) handleCloseModal();
          else setOpen(v);
        }}
        order={selectedOrder}
      />
    </div>
  );
}
