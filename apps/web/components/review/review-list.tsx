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

  if (loading) return <p>Loading...</p>;
  if (!reviews.length) return <p>Chưa có đánh giá</p>;

  return (
    <div className="mt-8 ">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="border p-4 rounded-xl bg-white shadow-sm my-3"
        >
          {/* RATING */}
          <div className="flex mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < r.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          {/* COMMENT */}
          <p className="text-lg text-gray-600">{r.comment}</p>

          {/* DATE */}
          <p className="text-base text-gray-400 mt-1">
            {new Date(r.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
      ))}
    </div>
  );
}