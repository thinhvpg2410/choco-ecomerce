"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import api from "@/services/axios";
import { Review } from "@/types/type";

export default function ReviewList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/products/${productId}/reviews`);
        const items: Review[] = res.data?.data?.items ?? [];
        setReviews(items);
      } catch (error) {
        console.error("Fetch reviews error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border">
        <p className="text-gray-500">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-sm border">
        <p className="text-gray-500 text-lg">
          Chưa có đánh giá nào cho sản phẩm này
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
        >
          {/* HEADER */}
          <div className="flex items-start gap-4">
            {/* AVATAR */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-rose-100 flex-shrink-0">
              {r.user?.avatar_url ? (
                <img
                  src={r.user.avatar_url}
                  alt={r.user.full_name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-600 font-bold text-lg">
                  {(r.user?.full_name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-900">
                    {r.user?.full_name || "Người dùng"}
                  </p>

                  <p className="text-sm text-gray-400 mt-0.5">
                    {new Date(r.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>

                {/* STARS */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < r.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              {r.comment && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {r.comment}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
