"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getOrderById } from "@/services/order.service";
import type { OrderApiResponse } from "@/services/order.service";
import {
  createReview,
  updateReview,
  getMyReviewForProduct, // ← Hàm mới
} from "@/services/review.service";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, MapPin, Star, Edit2 } from "lucide-react";
import { toast } from "sonner";

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
  const { id } = use(params);

  const [order, setOrder] = useState<OrderApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Lưu review của USER HIỆN TẠI cho từng sản phẩm
  const [myReviews, setMyReviews] = useState<Record<string, any>>({});

  // Modal Review
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

        // Load review CỦA TÔI cho từng sản phẩm
        const reviewsMap: Record<string, any> = {};
        for (const item of data.items) {
          console.log("ORDER DATA:", data);
          console.log("ORDER ITEMS:", data.items);
          try {
            const myReview = await getMyReviewForProduct(item.product_id);
            if (myReview) {
              reviewsMap[item.product_id] = myReview;
            }
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
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success("Cảm ơn bạn đã đánh giá! ❤️");
      }

      setShowReviewModal(false);

      // Refresh review của tôi cho sản phẩm
      const myReview = await getMyReviewForProduct(selectedProduct.product_id);
      setMyReviews((prev) => ({
        ...prev,
        [selectedProduct.product_id]: myReview,
      }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="bg-gray-900 text-white"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 cursor-pointer hover:underline"
              onClick={() => router.push("/order")}
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại danh sách đơn hàng
            </p>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
              Chi tiết đơn hàng
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              #{order.id} • {fmtDate(order.createdAt)}
            </p>
          </div>

          <div className="flex gap-3">
            <span className="inline-flex items-center rounded-full bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-600">
              {order.status}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold ${PAYMENT_STYLES[order.payment_status ?? "PENDING"]}`}
            >
              {order.payment_status || "PENDING"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT - SẢN PHẨM (chiếm nhiều không gian) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Sản phẩm đã mua
              </h2>

              <div className="space-y-6">
                {order.items.map((item) => {
                  const myReview = myReviews[item.product_id];
                  return (
                    <div
                      key={item.product_id}
                      className="rounded-2xl border border-gray-100 p-6 hover:border-rose-100 transition-all"
                    >
                      <div className="flex gap-5">
                        <div className="h-24 w-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-lg text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {fmt(item.price)} × {item.quantity}
                          </p>
                          <p className="text-lg font-bold text-rose-500 mt-2">
                            {fmt(item.price * item.quantity)}
                          </p>

                          {/* Nút đánh giá */}
                          <div className="mt-4">
                            {myReview ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReviewModal(item, myReview)}
                                className="text-rose-600 border-rose-200"
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Chỉnh sửa đánh giá
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => openReviewModal(item)}
                                className="bg-rose-500 hover:bg-rose-600 text-white"
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Đánh giá sản phẩm
                              </Button>
                            )}
                          </div>

                          {/* Hiển thị review CỦA TÔI */}
                          {myReview && (
                            <div className="mt-5 bg-rose-50 border border-rose-100 rounded-2xl p-5">
                              <div className="flex items-center gap-2 text-rose-600 mb-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <span key={s} className="text-xl">
                                    {s <= myReview.rating ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                              {myReview.comment && (
                                <p className="text-gray-700 italic">
                                  "{myReview.comment}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT - Thông tin khác */}
          <div className="lg:col-span-5 space-y-6">
            {/* Thông tin giao hàng + Tóm tắt giữ nguyên như cũ */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin giao hàng
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {order.receiver_name} • {order.receiver_phone}
                    </p>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Tóm tắt thanh toán
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số sản phẩm</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán</span>
                  <span className="font-medium">
                    {order.payment_method || "Thanh toán khi nhận hàng"}
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between text-base font-bold text-gray-900">
                  <span>Tổng tiền</span>
                  <span>{fmt(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-2">
              Đánh giá sản phẩm
            </h3>
            <p className="text-center text-gray-600 mb-6">
              {selectedProduct.name}
            </p>

            <div className="flex justify-center gap-4 text-5xl mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition"
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>

            <textarea
              className="w-full h-32 p-4 border border-gray-200 rounded-2xl focus:border-rose-400 resize-y"
              placeholder="Hãy chia sẻ cảm nhận của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                className="flex-1 py-6"
                onClick={() => setShowReviewModal(false)}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 py-6 bg-rose-500 hover:bg-rose-600"
                onClick={submitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
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
  );
}
