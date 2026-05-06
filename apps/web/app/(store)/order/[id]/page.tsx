"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getOrderById } from "@/services/order.service";
import type { OrderApiResponse } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, MapPin } from "lucide-react";

const fmt = (value: number) => value.toLocaleString("vi-VN") + "đ";

const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const PAYMENT_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-200 text-gray-700",
};
export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // ✅ FIX NEXT 15
  const { id } = use(params);

  const [order, setOrder] = useState<OrderApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error("GET ORDER ERROR:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-gray-900">
          Không tìm thấy đơn hàng
        </p>
        <Button
          onClick={() => router.push("/order")}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          Quay lại đơn hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 cursor-pointer"
              onClick={() => router.push("/order")}
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại đơn hàng
            </p>

            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
              Chi tiết đơn hàng
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              #{order.id} · {fmtDate(order.createdAt)}
            </p>
          </div>

          <span className="inline-flex items-center rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
            {order.status}
          </span>
          <span
            className={`mt-2 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
              PAYMENT_STYLES[order.payment_status ?? "PENDING"] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {order.payment_status}
          </span>
        </div>

        {/* BODY */}
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* PRODUCTS */}
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Sản phẩm đã mua
              </h2>

              <div className="mt-5 space-y-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-3xl border border-gray-100 p-4"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {fmt(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fmt(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SHIPPING */}
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Thông tin giao hàng
              </h2>

              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span>
                    {order.receiver_name} · {order.receiver_phone}
                  </span>
                </div>

                <p>{order.shipping_address}</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Số sản phẩm</span>
                  <span>{order.items.length}</span>
                </div>

                <div className="flex justify-between">
                  <span>Phương thức thanh toán</span>
                  <span>{order.payment_method || "COD"}</span>
                </div>

                <div className="flex justify-between text-base font-semibold text-gray-900">
                  <span>Tổng tiền</span>
                  <span>{fmt(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
