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
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
};

const statusConfig: Record<string, string> = {
  PENDING: "Chờ xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

const paymentConfig: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
};

const orderStatusTransitions: Record<string, string[]> = {
  PENDING: ["PENDING", "SHIPPING", "CANCELLED"],
  SHIPPING: ["SHIPPING", "DELIVERED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
};

export function OrderDetailModal({ open, onOpenChange, order }: Props) {
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("PENDING");

  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  const availableStatuses =
    orderStatusTransitions[order?.status] ??
    Object.keys(statusConfig);

  const currentPaymentStatus =
    order?.payment?.paymentStatus || order?.paymentStatus || "PENDING";

  useEffect(() => {
    if (order) {
      setStatus(order.status || "PENDING");
      setPaymentStatus(currentPaymentStatus);
    }
  }, [order, currentPaymentStatus]);

  useEffect(() => {
    if (!order) return;

    if (
      order.payment?.paymentMethod === "COD" &&
      status === "DELIVERED"
    ) {
      setPaymentStatus("PAID");
    }
  }, [order, status]);
  const handleUpdate = async () => {
    try {
      setLoading(true);

      // update order status
      if (status !== order.status) {
        await updateOrderStatus(order.id, status);
      }

      // update payment status
      if (paymentStatus !== currentPaymentStatus) {
        await updateOrderPaymentStatus(order.id, paymentStatus);
      }

      toast.success("Cập nhật đơn hàng thành công");

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Đơn hàng #{order.id.slice(-8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* TOP INFO */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* CUSTOMER */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-base">Khách hàng</h3>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Tên:</span>{" "}
                    {order.user?.username}
                  </p>

                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {order.user?.email}
                  </p>

                  <p>
                    <span className="font-medium">SĐT:</span>{" "}
                    {order.user?.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* PAYMENT */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-base">Thanh toán</h3>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Phương thức:</span>{" "}
                    {order.payment?.paymentMethod || "COD"}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Trạng thái:</span>

                    <Badge>
                      {paymentConfig[currentPaymentStatus] ||
                        currentPaymentStatus}
                    </Badge>
                  </div>

                  <p>
                    <span className="font-medium">Transaction:</span>{" "}
                    {order.payment?.transactionCode || "—"}
                  </p>

                  <p>
                    <span className="font-medium">Paid At:</span>{" "}
                    {order.payment?.paidAt
                      ? new Date(order.payment.paidAt).toLocaleString("vi-VN")
                      : "Chưa thanh toán"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ORDER */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-base">Quản lý đơn hàng</h3>

                {/* ORDER STATUS */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Trạng thái đơn hàng</p>

                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {availableStatuses.map((item) => (
                        <SelectItem key={item} value={item}>
                          {statusConfig[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* PAYMENT STATUS */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Trạng thái thanh toán</p>

                  <Select
                    value={paymentStatus}
                    onValueChange={setPaymentStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                      {order.payment?.paymentMethod !== "COD" || status === "DELIVERED" ? (
                        <SelectItem value="PAID">Đã thanh toán</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold">Luồng trạng thái hợp lệ</p>
                  <p className="mt-1">PENDING → SHIPPING → DELIVERED</p>
                  <p>PENDING → CANCELLED</p>
                  <p className="mt-2 text-slate-600">
                    {order.payment?.paymentMethod === "COD"
                      ? "Với COD, trạng thái thanh toán sẽ tự động thành PAID khi chuyển sang DELIVERED."
                      : "Với PayPal, nếu hủy đơn vẫn giữ trạng thái thanh toán PAID."}
                  </p>
                </div>

                <div className="space-y-2 text-sm border-t pt-4">
                  <p>
                    <span className="font-medium">Tạo lúc:</span>{" "}
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>

                  <p>
                    <span className="font-medium">Cập nhật:</span>{" "}
                    {new Date(order.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                <Button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SHIPPING */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-base mb-4">
                Thông tin giao hàng
              </h3>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Người nhận:</span>{" "}
                    {order.receiverName}
                  </p>

                  <p>
                    <span className="font-medium">SĐT:</span>{" "}
                    {order.receiverPhone}
                  </p>
                </div>

                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {order.shippingAddress}
                  </p>

                  <p>
                    {order.ward}, {order.city}
                  </p>
                </div>
              </div>

              {order.note && (
                <div className="mt-4 text-sm">
                  <span className="font-medium">Ghi chú:</span> {order.note}
                </div>
              )}
            </CardContent>
          </Card>

          {/* COUPON */}
          {order.coupon && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-base mb-4">Coupon</h3>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <p>
                    <span className="font-medium">Code:</span>{" "}
                    {order.coupon.code}
                  </p>

                  <p>
                    <span className="font-medium">Loại:</span>{" "}
                    {order.coupon.couponType}
                  </p>

                  <p>
                    <span className="font-medium">Giảm:</span>{" "}
                    {order.coupon.discountPercent}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PRODUCTS */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-base mb-4">Sản phẩm</h3>

              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border rounded-xl p-3"
                  >
                    <img
                      src={item.productImageAtTime}
                      alt={item.productNameAtTime}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />

                    <div className="flex-1">
                      <p className="font-medium">{item.productNameAtTime}</p>

                      <p className="text-sm text-muted-foreground mt-1">
                        SL: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {Number(
                          item.salePrice || item.price || 0,
                        ).toLocaleString("vi-VN")}{" "}
                        ₫ × {item.quantity}
                      </p>

                      <p className="font-semibold text-rose-600">
                        {(
                          Number(item.salePrice || item.price || 0) *
                          Number(item.quantity || 1)
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SUMMARY */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-base mb-4">Tổng kết</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính</span>

                  <span>
                    {Number(order.totalAmount).toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Phí ship</span>

                  <span>
                    {Number(order.shippingFee).toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Giảm giá</span>

                  <span>
                    -{" "}
                    {Number(order.discountAmount || 0).toLocaleString("vi-VN")}{" "}
                    ₫
                  </span>
                </div>

                <div className="flex justify-between border-t pt-4 text-lg font-bold">
                  <span>Tổng thanh toán</span>

                  <span className="text-rose-600">
                    {Number(order.finalAmount).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
