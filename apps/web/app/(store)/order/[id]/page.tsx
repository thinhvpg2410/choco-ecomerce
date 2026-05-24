"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getOrderById } from "@/services/order.service";
import type { OrderApiResponse } from "@/services/order.service";
import {
  createReview,
  updateReview,
  getMyReviewForOrderItem,
} from "@/services/review.service";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  MapPin,
  Star,
  Truck,
  Receipt,
  MessageCircle,
  Headset,
  Hash,
  CreditCard,
  Calendar,
  Clock,
  Box,
  ChevronRight,
  Flame,
  Sparkles,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Review } from "@/services/review.service";

const fmt = (value: number) => value.toLocaleString("vi-VN") + "đ";

const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const shortOrderId = (id: string) => id.split("-")[0].toUpperCase();

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã huỷ",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState<OrderApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState<Record<string, Review | null>>({});

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
        const reviewsMap: Record<string, any> = {};
        for (const item of data.items) {
          try {
            const myReview = await getMyReviewForOrderItem(item.order_item_id);
            if (myReview) reviewsMap[item.order_item_id] = myReview;
          } catch (_) {}
        }
        setMyReviews(reviewsMap);
      } catch (err) {
        console.error("GET ORDER ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const openReviewModal = (product: any, review?: any) => {
    setSelectedProduct(product);
    if (review) {
      setRating(review.rating);
      setComment(review.comment || "");
      setIsEditing(true);
      setCurrentReviewId(review.id);
    } else {
      setRating(5);
      setComment("");
      setIsEditing(false);
      setCurrentReviewId(null);
    }
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedProduct) return;
    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn từ 1 đến 5 sao");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditing && currentReviewId) {
        await updateReview(currentReviewId, {
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success("Đã cập nhật đánh giá!");
      } else {
        await createReview({
          product_id: selectedProduct.product_id,
          order_item_id: selectedProduct.order_item_id,
          rating,
          comment,
        });
        toast.success("Cảm ơn bạn đã đánh giá! ❤️");
      }
      setShowReviewModal(false);
      const myReview = await getMyReviewForOrderItem(
        selectedProduct.order_item_id,
      );
      setMyReviews((prev) => ({
        ...prev,
        [selectedProduct.order_item_id]: myReview,
      }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-lg font-semibold text-gray-900">
            Không tìm thấy đơn hàng
          </p>
          <Button
            onClick={() => router.push("/order")}
            className="bg-gray-900 text-white"
          >
            Quay lại
          </Button>
        </div>
      </ProtectedRoute>
    );
  }

  const subtotal =
    order.subtotal ??
    order.items.reduce(
      (s, i) => s + ((i as any).sale_price ?? i.price) * i.quantity,
      0,
    );
  const shippingFee: number = order.shipping_fee ?? 30000;
  const discount: number = order.discount_amount ?? 0;
  const totalAmount: number = Math.max(0, subtotal + shippingFee - discount);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f5f7]">
        {/* Top Nav */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/order")}
            className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">
            Chi tiết đơn hàng
          </h1>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col gap-2 pb-6">
          {/* Giao hàng */}
          <div className="bg-white px-4 pt-4 pb-5">
            {/* Status banner */}
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5 mb-4">
              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Đơn hàng đang ở trạng thái:{" "}
                <span className="font-semibold">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </p>
            </div>

            {/* Shipping info */}
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Thông tin giao hàng
            </p>
            <div className="flex gap-3 items-start">
              <MapPin className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {order.receiver_name}{" "}
                  <span className="text-gray-400 font-normal">·</span>{" "}
                  {order.receiver_phone}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </div>

          {/* Sản phẩm */}
          <div className="bg-white px-4 pt-4 pb-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Sản phẩm đã mua
            </p>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => {
                const myReview = myReviews[item.order_item_id];
                return (
                  <div key={item.order_item_id} className="py-4 first:pt-0">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-2.5 h-2.5" /> Mới
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                            <Flame className="w-2.5 h-2.5" /> Nổi bật
                          </span>
                        </div>

                        {/* Brand */}
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">
                          {(item as any).brand ?? ""}
                        </p>

                        {/* Name */}
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                          {item.name}
                        </p>

                        {/* Qty + Price */}
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-xs text-gray-400">
                            {fmt((item as any).sale_price ?? item.price)} ×{" "}
                            {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-rose-500">
                            {fmt(
                              ((item as any).sale_price ?? item.price) *
                                item.quantity,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* My review display */}
                    {myReview && (
                      <div className="mt-3 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-0.5 text-rose-400 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className="text-base">
                              {s <= myReview.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        {myReview.comment && (
                          <p className="text-sm text-gray-600 italic">
                            "{myReview.comment}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary breakdown */}
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">
                  Tạm tính ({order.items.length} sản phẩm)
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {fmt(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Phí vận chuyển</span>
                <span className="text-xs font-medium text-gray-700">
                  {fmt(shippingFee)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">
                    Giảm giá / Voucher
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    -{fmt(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-800">
                  Tổng cộng
                </span>
                <span className="text-lg font-bold text-rose-500">
                  {fmt(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* ── PHẦN 3: Hỗ trợ ── */}
          <div className="bg-white px-4 pt-4 pb-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Bạn cần hỗ trợ?
            </p>

            {[
              {
                icon: <Receipt className="w-4 h-4" />,
                iconBg: "bg-orange-50 text-orange-600",
                label: "Gửi yêu cầu trả hàng / hoàn tiền",
                sub: "Trong vòng 7 ngày kể từ khi nhận hàng",
              },
              {
                icon: <MessageCircle className="w-4 h-4" />,
                iconBg: "bg-blue-50 text-blue-600",
                label: "Liên hệ shop",
                sub: "Phản hồi thường trong 1–2 giờ",
              },
              {
                icon: <Headset className="w-4 h-4" />,
                iconBg: "bg-green-50 text-green-600",
                label: "Trung tâm hỗ trợ",
                sub: "FAQ · Hướng dẫn · Chính sách",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconBg}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* ── PHẦN 4: Thông tin đơn ── */}
          <div className="bg-white px-4 pt-4 pb-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Thông tin đơn hàng
            </p>

            <div className="space-y-3">
              {/* Order ID */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Hash className="w-3.5 h-3.5" />
                  <span className="text-sm">Mã đơn hàng</span>
                </div>
                <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md tracking-wide">
                  {shortOrderId(order.id)}
                </span>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Payment method */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-sm">Phương thức TT</span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {order.payment_method === "COD"
                    ? "Thanh toán khi nhận (COD)"
                    : order.payment_method === "BANK_TRANSFER"
                      ? "Chuyển khoản ngân hàng"
                      : (order.payment_method ?? "Thanh toán khi nhận (COD)")}
                </span>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Payment status */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="text-sm">Trạng thái TT</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.payment_status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.payment_status === "PAID"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </span>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Created at */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-sm">Thời gian đặt</span>
                </div>
                <span className="text-sm text-gray-800">
                  {fmtDate(order.createdAt)}
                </span>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Item count */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Box className="w-3.5 h-3.5" />
                  <span className="text-sm">Số sản phẩm</span>
                </div>
                <span className="text-sm text-gray-800">
                  {order.items.length} sản phẩm
                </span>
              </div>
            </div>

            {/* ── Đánh giá sản phẩm ── */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <Button
                className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-12 text-base font-semibold"
                onClick={() => {
                  if (order.items.length > 0) {
                    const firstUnreviewed =
                      order.items.find((i) => !myReviews[i.order_item_id]) ??
                      order.items[0];
                    openReviewModal(
                      firstUnreviewed,
                      myReviews[firstUnreviewed.order_item_id],
                    );
                  }
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                Đánh giá sản phẩm
              </Button>
            </div>
          </div>
        </div>

        {/* ── REVIEW MODAL ── */}
        {showReviewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    Đánh giá sản phẩm
                  </p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {selectedProduct.name}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3 text-5xl mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition-transform hover:scale-110 ${
                      star <= rating ? "text-amber-400" : "text-gray-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="w-full h-28 p-4 border border-gray-200 rounded-2xl text-sm focus:border-rose-400 focus:outline-none resize-none"
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl"
                  onClick={() => setShowReviewModal(false)}
                >
                  Huỷ
                </Button>
                <Button
                  className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600"
                  onClick={submitReview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isEditing ? (
                    "Cập nhật"
                  ) : (
                    "Gửi đánh giá"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
