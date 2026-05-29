"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getOrderById, cancelOrder } from "@/services/order.service";
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
  Box,
  ChevronRight,
  Tag,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PackageCheck,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Review } from "@/services/review.service";

const fmt = (v: number) => v.toLocaleString("vi-VN") + "đ";
const fmtDate = (v: string) =>
  new Date(v).toLocaleDateString("vi-VN", {
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

const STATUS_META: Record<
  string,
  { icon: any; bg: string; accent: string; text: string; pill: string }
> = {
  PENDING: {
    icon: Clock,
    bg: "bg-amber-50",
    accent: "bg-amber-400",
    text: "text-amber-600",
    pill: "bg-amber-100 text-amber-700",
  },
  CONFIRMED: {
    icon: CheckCircle2,
    bg: "bg-sky-50",
    accent: "bg-sky-500",
    text: "text-sky-600",
    pill: "bg-sky-100 text-sky-700",
  },
  SHIPPING: {
    icon: Truck,
    bg: "bg-violet-50",
    accent: "bg-violet-500",
    text: "text-violet-600",
    pill: "bg-violet-100 text-violet-700",
  },
  DELIVERED: {
    icon: PackageCheck,
    bg: "bg-emerald-50",
    accent: "bg-emerald-500",
    text: "text-emerald-600",
    pill: "bg-emerald-100 text-emerald-700",
  },
  CANCELLED: {
    icon: Ban,
    bg: "bg-red-50",
    accent: "bg-red-400",
    text: "text-red-500",
    pill: "bg-red-100 text-red-600",
  },
};

// Subtle tinted backgrounds cycling per card — same layout, different feel
const CARD_TINTS = ["bg-white", "bg-slate-50", "bg-stone-50", "bg-zinc-50"];

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"];

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
        const map: Record<string, any> = {};
        for (const item of data.items) {
          try {
            const r = await getMyReviewForOrderItem(item.order_item_id);
            if (r) map[item.order_item_id] = r;
          } catch (_) {}
        }
        setMyReviews(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
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
    if (!selectedProduct || rating < 1 || rating > 5) {
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
      const r = await getMyReviewForOrderItem(selectedProduct.order_item_id);
      setMyReviews((prev) => ({ ...prev, [selectedProduct.order_item_id]: r }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await cancelOrder(order.id);
      toast.success("Đã huỷ đơn hàng thành công");
      setShowCancelModal(false);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Huỷ đơn hàng thất bại");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading)
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-7 h-7 animate-spin text-rose-400" />
        </div>
      </ProtectedRoute>
    );

  if (!order)
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
          <p className="text-base font-semibold text-gray-900">
            Không tìm thấy đơn hàng
          </p>
          <Button
            onClick={() => router.push("/order")}
            className="bg-gray-900 text-white rounded-xl"
          >
            Quay lại
          </Button>
        </div>
      </ProtectedRoute>
    );

  const subtotal = order.items.reduce(
  (s, i) => s + ((i as any).sale_price ?? i.price) * i.quantity,
  0,
);
const shippingFee: number = order.shipping_fee ?? 30000;
const discount: number = order.discount_amount ?? 0;
const totalAmount: number = order.final_amount;
const canCancel = CANCELLABLE_STATUSES.includes(order.status);
const canReview = order.status === "DELIVERED";
const meta = STATUS_META[order.status] ?? STATUS_META["PENDING"];
const StatusIcon = meta.icon;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f2f2f5] flex flex-col">
        {/* ── NAV ── */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 flex items-center gap-4">
          <button
            onClick={() => router.push("/order")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-900 flex-1">
            Chi tiết đơn hàng
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.pill}`}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>

        {/* ── 2-COL GRID ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 max-w-6xl mx-auto w-full px-6 py-8">
          {/* ══ LEFT SIDEBAR (sticky) ══ */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-[57px] lg:self-start">
            {/* Status Hero */}
            <div
              className={`relative overflow-hidden rounded-3xl ${meta.bg} p-6`}
            >
              <div
                className={`absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20 ${meta.accent}`}
              />
              <div
                className={`absolute -bottom-10 -left-6 w-28 h-28 rounded-full opacity-10 ${meta.accent}`}
              />
              <div
                className={`inline-flex items-center gap-2 mb-4 ${meta.text}`}
              >
                <StatusIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                Tổng thanh toán
              </p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">
                {fmt(totalAmount)}
              </p>
              <div className={`mt-4 h-1 w-16 rounded-full ${meta.accent}`} />
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Địa chỉ giao hàng
              </p>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.receiver_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.receiver_phone}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    {order.shipping_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Order info */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Thông tin đơn
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: <Hash className="w-3.5 h-3.5" />,
                    label: "Mã đơn",
                    value: (
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg">
                        {shortOrderId(order.id)}
                      </span>
                    ),
                  },
                  {
                    icon: <CreditCard className="w-3.5 h-3.5" />,
                    label: "Thanh toán",
                    value: (
                      <span className="text-xs text-gray-700">
                        {order.payment_method === "COD"
                          ? "COD"
                          : order.payment_method === "BANK_TRANSFER"
                            ? "Chuyển khoản"
                            : (order.payment_method ?? "COD")}
                      </span>
                    ),
                  },
                  {
                    icon: <Tag className="w-3.5 h-3.5" />,
                    label: "Trạng thái TT",
                    value: (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${order.payment_status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {order.payment_status === "PAID" ? "Đã TT" : "Chưa TT"}
                      </span>
                    ),
                  },
                  {
                    icon: <Calendar className="w-3.5 h-3.5" />,
                    label: "Đặt lúc",
                    value: (
                      <span className="text-xs text-gray-700">
                        {fmtDate(order.createdAt)}
                      </span>
                    ),
                  },
                  {
                    icon: <Box className="w-3.5 h-3.5" />,
                    label: "Số lượng",
                    value: (
                      <span className="text-xs text-gray-700">
                        {order.items.length} sản phẩm
                      </span>
                    ),
                  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                      {row.icon}
                      <span className="text-xs">{row.label}</span>
                    </div>
                    {row.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              <div className="px-5 pt-5 pb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Hỗ trợ
                </p>
              </div>
              {[
                {
                  icon: <Receipt className="w-3.5 h-3.5" />,
                  bg: "bg-orange-50 text-orange-500",
                  label: "Trả hàng / hoàn tiền",
                  sub: "Trong 7 ngày",
                },
                {
                  icon: <MessageCircle className="w-3.5 h-3.5" />,
                  bg: "bg-sky-50 text-sky-500",
                  label: "Liên hệ shop",
                  sub: "Phản hồi 1–2 giờ",
                },
                {
                  icon: <Headset className="w-3.5 h-3.5" />,
                  bg: "bg-emerald-50 text-emerald-500",
                  label: "Trung tâm hỗ trợ",
                  sub: "FAQ · Chính sách",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${item.bg}`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-gray-400">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </div>
              ))}
            </div>

            {/* Cancel */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-400 rounded-2xl h-11 text-sm font-medium shadow-sm hover:bg-red-50 transition"
              >
                <XCircle className="w-4 h-4" />
                Huỷ đơn hàng
              </button>
            )}
          </div>

          {/* ══ RIGHT — PRODUCTS ══ */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-gray-900">
                Sản phẩm đã mua
              </p>
              <span className="text-xs text-gray-400">
                {order.items.length} sản phẩm
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {order.items.map((item, idx) => {
                const myReview = myReviews[item.order_item_id];
                const tint = CARD_TINTS[idx % CARD_TINTS.length];

                return (
                  <div
                    key={item.order_item_id}
                    className={`${tint} rounded-3xl shadow-sm overflow-hidden border border-gray-100/60`}
                  >
                    <div className="flex gap-4 p-5">
                      {/* Image */}
                      <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 self-start">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {(item as any).brand && (
                          <p className="text-[10px] text-gray-400 mb-0.5">
                            {(item as any).brand}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                          {item.name}
                        </p>
                        <div className="flex items-end mt-2 gap-2">
                          <p className="text-lg font-bold text-rose-500 leading-none">
                            {fmt(
                              ((item as any).sale_price ?? item.price) *
                                item.quantity,
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mb-0.5">
                            {fmt((item as any).sale_price ?? item.price)} ×{" "}
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review display */}
                    {myReview && (
                      <div className="mx-5 mb-3 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                        <div className="flex gap-0.5 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`text-sm ${s <= myReview.rating ? "text-amber-400" : "text-gray-200"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {myReview.comment && (
                          <p className="text-xs text-gray-500 italic leading-relaxed">
                            "{myReview.comment}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Review button */}
                    {canReview && (
                      <button
                        onClick={() =>
                          openReviewModal(item, myReview ?? undefined)
                        }
                        className={`mx-5 mb-5 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                          myReview
                            ? "border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100"
                            : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        {myReview ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Price summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Tổng kết đơn hàng
              </p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Tạm tính ({order.items.length} sản phẩm)
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {fmt(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Phí vận chuyển</span>
                  <span className="text-sm font-medium text-gray-800">
                    {fmt(shippingFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Giảm giá / Voucher
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      -{fmt(discount)}
                    </span>
                  </div>
                )}
                <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-rose-500">
                    {fmt(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── REVIEW MODAL ── */}
        {showReviewModal && selectedProduct && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowReviewModal(false);
            }}
          >
            <div className="bg-white rounded-3xl w-full max-w-md p-7 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {isEditing ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {selectedProduct.name}
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-5xl leading-none transition-transform hover:scale-110 active:scale-95 ${star <= rating ? "text-amber-400" : "text-gray-100"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="w-full h-24 p-4 border border-gray-200 rounded-2xl text-sm focus:border-rose-300 focus:outline-none resize-none bg-gray-50 placeholder-gray-400"
                placeholder="Chia sẻ cảm nhận của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-2xl text-sm"
                  onClick={() => setShowReviewModal(false)}
                >
                  Huỷ
                </Button>
                <Button
                  className="flex-1 h-11 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold"
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

        {/* ── CANCEL MODAL ── */}
        {showCancelModal && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCancelModal(false);
            }}
          >
            <div className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-base font-bold text-gray-900">Huỷ đơn hàng?</p>
              <p className="text-sm text-gray-400 mt-2 mb-6 leading-relaxed">
                Bạn có chắc muốn huỷ không?
                <br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-2xl text-sm"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                >
                  Giữ đơn
                </Button>
                <Button
                  className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Xác nhận huỷ"
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
