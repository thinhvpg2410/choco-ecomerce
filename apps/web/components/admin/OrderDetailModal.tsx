"use client";

import { useEffect, useState } from "react";
import {
  updateOrderStatus,
  updateOrderPaymentStatus,
} from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  User,
  CreditCard,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  AlertTriangle,
  Receipt,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
};

const orderStatusTransitions: Record<string, string[]> = {
  PENDING: ["PENDING", "SHIPPING", "CANCELLED"],
  SHIPPING: ["SHIPPING", "DELIVERED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
};

const statusMeta: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: any;
  }
> = {
  PENDING: {
    label: "Chờ xử lý",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  SHIPPING: {
    label: "Đang giao",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: XCircle,
  },
};

const paymentMeta: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PAID: {
    label: "Đã thanh toán",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  PENDING: {
    label: "Chưa thanh toán",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
};

const FLOW = ["PENDING", "SHIPPING", "DELIVERED"] as const;

export function OrderDetailModal({ open, onOpenChange, order }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  const availableStatuses =
    orderStatusTransitions[order?.status] ?? Object.keys(statusMeta);

  const currentPaymentStatus =
    order?.payment?.paymentStatus ?? order?.paymentStatus ?? "PENDING";

  // Sync state khi order thay đổi
  useEffect(() => {
    if (order) {
      setStatus(order.status ?? "PENDING");
      setPaymentStatus(currentPaymentStatus);
    }
  }, [order, currentPaymentStatus]);

  // Auto-set PAID khi COD chuyển sang DELIVERED
  useEffect(() => {
    if (!order) return;
    if (order.payment?.paymentMethod === "COD" && status === "DELIVERED") {
      setPaymentStatus("PAID");
    }
  }, [order, status]);

  // ── Giữ đúng logic gốc: gọi cả 2 API nếu cả 2 thay đổi ────────────────
  const handleUpdate = async () => {
    const statusChanged = status !== order.status;
    const paymentChanged = paymentStatus !== currentPaymentStatus;

    if (!statusChanged && !paymentChanged) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }

    try {
      setLoading(true);

      if (statusChanged) {
        await updateOrderStatus(order.id, status);
      }

      if (paymentChanged) {
        await updateOrderPaymentStatus(order.id, paymentStatus);
      }

      toast.success("Cập nhật đơn hàng thành công");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const paymentInfo = paymentMeta[currentPaymentStatus] ?? {
    label: currentPaymentStatus,
    color: "",
    bg: "",
  };
  const orderStatus = statusMeta[order.status] ?? statusMeta["PENDING"];
  const Icon = orderStatus.icon;
  const isCancelled = order.status === "CANCELLED";
  const isDelivered = order.status === "DELIVERED";
  const isLocked = isCancelled || isDelivered;

  const willBecomePaid =
    status === "DELIVERED" &&
    order.payment?.paymentMethod === "COD" &&
    currentPaymentStatus === "PENDING";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        {/* ── HEADER ── */}
        <div
          className={`px-6 pt-6 pb-5 border-b ${orderStatus.bg} ${orderStatus.border}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${orderStatus.bg} border ${orderStatus.border}`}
              >
                <Icon className={`w-5 h-5 ${orderStatus.color}`} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Đơn hàng #{order.id.slice(-8).toUpperCase()}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${orderStatus.bg} ${orderStatus.color} border ${orderStatus.border}`}
              >
                {orderStatus.label}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${paymentInfo.bg} ${paymentInfo.color}`}
              >
                {paymentInfo.label}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {!isCancelled && (
            <div className="mt-5 flex items-center">
              {FLOW.map((step, i) => {
                const meta = statusMeta[step];
                const StepIcon = meta.icon;
                const done = FLOW.indexOf(order.status as any) >= i;
                return (
                  <div
                    key={step}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                        ${done ? `${meta.bg} ${meta.border} ${meta.color}` : "bg-white border-border text-muted-foreground/40"}
                      `}
                      >
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap ${done ? meta.color : "text-muted-foreground/50"}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    {i < FLOW.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mb-4 mx-1 rounded-full transition-colors ${
                          FLOW.indexOf(order.status as any) > i
                            ? "bg-emerald-300"
                            : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* ── KHÁCH HÀNG & ĐỊA CHỈ ── */}
            <Card className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Khách hàng</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tài khoản</span>
                    <span className="font-medium">
                      {order.user?.username || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-xs">
                      {order.user?.email || "—"}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{order.receiverName}</p>
                      <p className="text-muted-foreground text-xs">
                        {order.receiverPhone}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>
                  {order.note && (
                    <div className="flex gap-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                      <span className="font-medium flex-shrink-0">
                        Ghi chú:
                      </span>
                      <span>{order.note}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── THANH TOÁN & TỔNG KẾT ── */}
            <Card className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Thanh toán</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phương thức</span>
                    <span className="font-semibold">
                      {order.payment?.paymentMethod ||
                        order.paymentMethod ||
                        "COD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${paymentInfo.bg} ${paymentInfo.color}`}
                    >
                      {paymentInfo.label}
                    </span>
                  </div>
                  {order.payment?.transactionCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã GD</span>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {order.payment.transactionCode}
                      </code>
                    </div>
                  )}
                  {order.payment?.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Thanh toán lúc
                      </span>
                      <span className="text-xs">
                        {new Date(order.payment.paidAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="border-t pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>
                      {Number(order.totalAmount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí ship</span>
                    <span>
                      {Number(order.shippingFee || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Giảm giá</span>
                      <span>
                        -{Number(order.discountAmount).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1.5 border-t border-dashed">
                    <span>Tổng cộng</span>
                    <span className="text-rose-600">
                      {Number(order.finalAmount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── SẢN PHẨM ── */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">
                  Sản phẩm ({order.items?.length ?? 0})
                </h3>
              </div>
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <img
                      src={item.productImageAtTime || item.image}
                      alt={item.productNameAtTime}
                      className="w-14 h-14 object-cover rounded-lg border border-border/60 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.productNameAtTime}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Number(
                          item.salePrice || item.price || 0,
                        ).toLocaleString("vi-VN")}
                        đ × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-sm flex-shrink-0">
                      {(
                        Number(item.salePrice || item.price || 0) *
                        Number(item.quantity)
                      ).toLocaleString("vi-VN")}
                      đ
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── CẬP NHẬT TRẠNG THÁI ── */}
          {!isLocked ? (
            <Card className="border-border/60">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Cập nhật trạng thái</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Order status */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Trạng thái đơn hàng
                    </p>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusMeta[s]?.label ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment status */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Trạng thái thanh toán
                    </p>
                    <Select
                      value={paymentStatus}
                      onValueChange={setPaymentStatus}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                        {/* COD chỉ được PAID khi DELIVERED, phương thức khác luôn được chọn */}
                        {(order.payment?.paymentMethod !== "COD" ||
                          status === "DELIVERED") && (
                          <SelectItem value="PAID">Đã thanh toán</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview thay đổi */}
                {(status !== order.status ||
                  paymentStatus !== currentPaymentStatus) && (
                  <div
                    className={`flex items-start gap-2.5 p-3 rounded-xl text-xs border ${
                      status === "CANCELLED"
                        ? "bg-red-50 border-red-100 text-red-700"
                        : "bg-blue-50 border-blue-100 text-blue-700"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      {status !== order.status && (
                        <p className="font-semibold">
                          Đơn hàng: {statusMeta[order.status]?.label} →{" "}
                          {statusMeta[status]?.label}
                        </p>
                      )}
                      {paymentStatus !== currentPaymentStatus && (
                        <p className="font-semibold">
                          Thanh toán: {paymentMeta[currentPaymentStatus]?.label}{" "}
                          → {paymentMeta[paymentStatus]?.label}
                        </p>
                      )}
                      {willBecomePaid && (
                        <p className="opacity-80">
                          COD giao thành công → tự động đánh dấu đã thanh toán.
                        </p>
                      )}
                      {status === "CANCELLED" && (
                        <p className="opacity-80">
                          Hành động này không thể hoàn tác.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Gợi ý luồng */}
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-foreground">
                    Luồng xử lý chuẩn
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {["PENDING", "SHIPPING", "DELIVERED"].map((s, i) => (
                      <span key={s} className="flex items-center gap-1">
                        <span className={statusMeta[s]?.color}>
                          {statusMeta[s]?.label}
                        </span>
                        {i < 2 && <ChevronRight className="w-3 h-3" />}
                      </span>
                    ))}
                  </div>
                  <p>PENDING → CANCELLED (nếu cần hủy)</p>
                  <p className="mt-1">
                    {order.payment?.paymentMethod === "COD"
                      ? "COD: thanh toán tự động PAID khi chuyển sang DELIVERED."
                      : "PayPal/QR: trạng thái thanh toán có thể chỉnh tay nếu cần."}
                  </p>
                </div>

                <Button
                  onClick={handleUpdate}
                  disabled={
                    loading ||
                    (status === order.status &&
                      paymentStatus === currentPaymentStatus)
                  }
                  className="w-full h-10 font-semibold"
                >
                  {loading ? "Đang cập nhật..." : "Xác nhận cập nhật"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${orderStatus.bg} ${orderStatus.border} ${orderStatus.color}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              Đơn hàng đã {isCancelled ? "hủy" : "giao thành công"} — không thể
              chỉnh sửa thêm.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
