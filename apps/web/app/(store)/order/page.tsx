"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders } from "@/services/order.service";
import type { OrderApiResponse } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ChevronRight } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SHIPPING: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const PAYMENT_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
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
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    </ProtectedRoute>
  );
}

  return (
    <ProtectedRoute>
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
                    className="group rounded-[28px] bg-white border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="font-semibold text-gray-500">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>{fmtDate(order.createdAt)}</span>
                        </div>

                        <h2 className="mt-2 text-lg font-black text-gray-900">
                          {fmt(order.total_amount)}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.items.length} sản phẩm
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            STATUS_STYLES[order.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            PAYMENT_STYLES[order.payment_status ?? "PENDING"] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={firstItem?.image}
                          alt={firstItem?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          {firstItem?.name}
                        </p>

                        {extraCount > 0 && (
                          <p className="text-sm text-gray-400 mt-1">
                            +{extraCount} sản phẩm khác
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/order/${order.id}`}
                        className="flex items-center gap-1 text-sm font-bold text-rose-500 hover:text-rose-600"
                      >
                        Chi tiết
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
