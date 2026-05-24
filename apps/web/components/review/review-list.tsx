"use client";

import { useEffect, useState } from "react";
import { Star, MessageCircle, SlidersHorizontal } from "lucide-react";
import api from "@/services/axios";
import { Review } from "@/types/type";

export default function ReviewList({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStar, setFilterStar] = useState<number | null>(null);

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

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const displayed = filterStar
    ? reviews.filter((r) => r.rating === filterStar)
    : reviews;

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-5 rounded-xl border border-gray-100"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-full animate-pulse bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-28 rounded animate-pulse bg-gray-100" />
              <div className="h-3 w-16 rounded animate-pulse bg-gray-100" />
              <div className="h-3 w-full rounded animate-pulse bg-gray-50 mt-3" />
              <div className="h-3 w-3/4 rounded animate-pulse bg-gray-50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── EMPTY ── */
  if (!reviews.length) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <MessageCircle className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-600 text-sm">
            Chưa có đánh giá nào
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Hãy là người đầu tiên chia sẻ cảm nhận!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── SUMMARY ── */}
      <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl bg-gray-50 border border-gray-100 mb-6">
        {/* Score */}
        <div className="flex flex-col items-center justify-center sm:pr-6 sm:border-r border-gray-200 min-w-[96px] gap-1">
          <span
            className="text-[3.25rem] font-black text-gray-900 leading-none"
            style={{ letterSpacing: "-0.05em" }}
          >
            {avgRating.toFixed(1)}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? "text-orange-400 fill-orange-400" : "text-gray-200 fill-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 mt-0.5">
            {reviews.length} đánh giá
          </span>
        </div>

        {/* Bars */}
        <div className="flex-1 flex flex-col justify-center gap-2">
          {ratingCounts.map(({ star, count }) => {
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            const active = filterStar === star;
            return (
              <button
                key={star}
                onClick={() => setFilterStar(active ? null : star)}
                className={`flex items-center gap-2.5 group w-full rounded-lg px-2 py-1 -mx-2 transition-colors ${
                  active ? "bg-orange-50" : "hover:bg-gray-100"
                }`}
              >
                <span className="text-xs font-semibold text-gray-500 w-3 text-right">
                  {star}
                </span>
                <Star className="w-3 h-3 text-orange-400 fill-orange-400 flex-shrink-0" />
                <div className="flex-1 h-[6px] rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: active
                        ? "linear-gradient(90deg, #f97316, #fb923c)"
                        : "linear-gradient(90deg, #fdba74, #fcd34d)",
                    }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 w-5 text-right">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTER TAGS ── */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <button
          onClick={() => setFilterStar(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
            filterStar === null
              ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
              : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600"
          }`}
        >
          Tất cả ({reviews.length})
        </button>
        {ratingCounts
          .filter(({ count }) => count > 0)
          .map(({ star, count }) => (
            <button
              key={star}
              onClick={() => setFilterStar(filterStar === star ? null : star)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                filterStar === star
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                  : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {star}
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          ))}
      </div>

      {/* ── NO MATCH ── */}
      {displayed.length === 0 && (
        <div className="py-10 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-400">
            Không có đánh giá {filterStar} sao nào
          </p>
        </div>
      )}

      {/* ── LIST ── */}
      <div className="space-y-3">
        {displayed.map((r, idx) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:border-orange-200 hover:shadow-sm"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <div className="flex items-start gap-3.5">
              {/* AVATAR */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 ring-2 ring-orange-50">
                {r.user?.avatar_url ? (
                  <img
                    src={r.user.avatar_url}
                    alt={r.user.full_name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {(r.user?.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">
                      {r.user?.full_name || "Người dùng"}
                    </p>
                    {/* Star badge */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < r.rating
                              ? "text-orange-400 fill-orange-400"
                              : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {new Date(r.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>

                {r.comment && (
                  <p className="mt-2.5 text-gray-600 text-sm leading-relaxed">
                    {r.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
