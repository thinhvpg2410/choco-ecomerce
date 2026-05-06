"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders } from "@/services/order.service";
import type { OrderApiResponse } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  SHIPPING: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  RETURNED: "bg-gray-200 text-gray-700",
};

const PAYMENT_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-200 text-gray-700",
};

const fmt = (value: number) => value.toLocaleString("vi-VN") + "đ";

const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Get orders failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Đơn hàng của tôi
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Xem lịch sử đơn hàng và trạng thái giao hàng
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Package className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-white p-10 text-center">
            <p className="text-sm font-semibold text-gray-800">
              Bạn chưa có đơn hàng nào
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Hãy mua sắm để tạo đơn hàng đầu tiên
            </p>

            <Button
              onClick={() => (window.location.href = "/")}
              className="mt-6 bg-rose-500 hover:bg-rose-600 text-white"
            >
              Mua sắm ngay
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const extraCount = (order.items?.length || 0) - 1;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  {/* TOP */}
                  <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                    <div>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span>•</span>
                        <span>{fmtDate(order.createdAt)}</span>
                      </div>

                      <h2 className="mt-2 font-bold text-lg text-gray-900">
                        {order.items.length} sản phẩm ·{" "}
                        {fmt(order.total_amount)}
                      </h2>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        STATUS_STYLES[order.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`ml-2 inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        PAYMENT_STYLES[order.payment_status ?? "PENDING"] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="mt-5 grid sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-400">
                        Giao hàng
                      </p>
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {order.receiver_name} · {order.receiver_phone}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.shipping_address}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-gray-400">
                        Thanh toán
                      </p>
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {order.payment_method || "COD"}
                      </p>
                    </div>
                  </div>

                  {/* PRODUCTS PREVIEW */}
                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {firstItem?.name}
                      {extraCount > 0 && (
                        <span className="text-gray-400">
                          {" "}
                          +{extraCount} sản phẩm khác
                        </span>
                      )}
                    </div>

                    {orders.map((order) => {
                      if (!order?.id) return null;

                      return (
                        <div key={order.id}>
                          <Link href={`/order/${order.id}`}>Xem chi tiết</Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
