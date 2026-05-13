"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  productId: string;
  mainImage: string;
  productName: string;
};

type ProductImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

export default function ProductImageGallery({
  productId,
  mainImage,
  productName,
}: Props) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selected, setSelected] = useState<string>(mainImage);
  const [startIndex, setStartIndex] = useState(0);

  const VISIBLE_COUNT = 4;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get(`/product-images?product_id=${productId}`);

        let data: ProductImage[] = res.data || [];

        // 👉 check nếu mainImage chưa có trong list thì add vào
        const exists = data.some((img) => img.imageUrl === mainImage);

        if (!exists && mainImage) {
          data = [
            {
              id: "main",
              imageUrl: mainImage,
              sortOrder: -1,
            },
            ...data,
          ];
        }

        setImages(data);

        // 👉 luôn đảm bảo selected hợp lệ
        setSelected(mainImage || data[0]?.imageUrl || "");
      } catch (err) {
        console.error(err);
      }
    };

    fetchImages();
  }, [productId, mainImage]);

  const normalizedImages = useMemo(() => {
    if (!images.length) return [];
    return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [images]);

  const total = normalizedImages.length;

  const getVisible = () => {
    if (total <= VISIBLE_COUNT) return normalizedImages;
    const result = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      result.push(normalizedImages[(startIndex + i) % total]);
    }
    return result;
  };

  const next = () => {
    if (total > VISIBLE_COUNT) setStartIndex((p) => (p + 1) % total);
  };
  const prev = () => {
    if (total > VISIBLE_COUNT) setStartIndex((p) => (p - 1 + total) % total);
  };

  const visible = getVisible();

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── MAIN IMAGE ── */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl group">
        <img
          src={selected}
          alt={productName}
          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* ── THUMBNAIL ROW — nằm ngoài div ảnh chính ── */}
      {total > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={total <= VISIBLE_COUNT}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-30 transition"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2 flex-1 justify-center">
            {visible.map((img) => {
              const isActive = selected === img.imageUrl;
              return (
                <button
                  key={img.id}
                  onClick={() => setSelected(img.imageUrl)}
                  className={`
                    relative flex-1 max-w-[80px] aspect-square rounded-xl overflow-hidden border-2
                    bg-white transition-all duration-200
                    ${
                      isActive
                        ? "border-rose-400 shadow-md scale-105"
                        : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300"
                    }
                  `}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute inset-0 ring-2 ring-rose-300/50 rounded-xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={next}
            disabled={total <= VISIBLE_COUNT}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-30 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
