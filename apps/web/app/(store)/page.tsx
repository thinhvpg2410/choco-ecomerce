"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { bannerService, Banner } from "@/services/banner.service";
import { getProducts } from "@/services/product.service";
import { ProductCard } from "@/components/product/product-card";
import { toast } from "sonner";

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  //DOT STATE
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  const plugin = useRef(
    Autoplay({
      delay: 5000,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    }),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [bannerData, bestData, newData, featuredData] = await Promise.all(
          [
            bannerService.getActiveBanners().catch(() => []),
            getProducts({ is_best_seller: true, limit: 10 }).catch(() => ({
              products: [],
            })),
            getProducts({ is_new: true, limit: 10 }).catch(() => ({
              products: [],
            })),
            getProducts({ is_featured: true, limit: 10 }).catch(() => ({
              products: [],
            })),
          ],
        );
        console.log("BANNERS:", bannerData);
        setBanners(bannerData || []);
        setBestSellers(bestData.products || []);
        setNewProducts(newData.products || []);
        setFeatured(featuredData.products || []);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu Home:", err);
        toast.error("Không thể tải một số dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔥 SYNC DOT
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main>
        {/* ==================== HERO SECTION ==================== */}
        <div className="relative bg-gradient-to-br from-[#3b1d14] via-[#5c2f1f] to-[#3b1d14] text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center py-2 md:py-3">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-serif leading-tight">
                Welcome to <br />
                <span className="text-[#f5d9b0]">Choco Kingdom</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200">
                Thế giới socola và bánh kẹo cao cấp – nơi niềm vui ngọt ngào bắt
                đầu.
              </p>
            </div>

            <div className="hidden md:block">
              <img
                src="/ChocoKingdom_Logo.jpg"
                alt="Choco Kingdom Logo"
                className="w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>

        {/* ==================== BANNER CAROUSEL ==================== */}
        {banners.length > 0 && (
          <div className="w-full relative z-10 pt-2 pb-12 bg-white">
            <Carousel
              plugins={[plugin.current]}
              opts={{ loop: true }}
              setApi={setApi}
            >
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <Link
                      href={
                        banner.product_id
                          ? `/product/${banner.product_id}`
                          : banner.link || "#"
                      }
                    >
                      <div className="relative overflow-hidden group">
                        <img
                          src={banner.image_url || banner.imageUrl}
                          alt={banner.description || "Banner"}
                          className="w-full h-[260px] md:h-[380px] lg:h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://picsum.photos/800/400?random=88";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="left-6" />
              <CarouselNext className="right-6" />
            </Carousel>

            {/* 🔵 DOT */}
            <div className="flex justify-center gap-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    current === index
                      ? "bg-rose-600 w-6"
                      : "bg-gray-300 w-2.5 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ==================== BEST SELLERS ==================== */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="uppercase text-rose-600 font-medium tracking-widest">
                HOT PRODUCTS
              </p>
              <h2 className="text-4xl font-serif mt-2">Best Sellers</h2>
              <p className="mt-4 text-gray-600 text-[15px]">
                Những sản phẩm bán chạy nhất tháng này
              </p>
              <Link
                href="/product?is_best_seller=true"
                className="mt-6 inline-block text-rose-600 hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="md:col-span-9">
              <Carousel opts={{ align: "start" }}>
                <CarouselContent className="-ml-3">
                  {bestSellers.map((p) => (
                    <CarouselItem
                      key={p.id}
                      className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                    >
                      <ProductCard product={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

        {/* ==================== NEW ARRIVALS ==================== */}
        <section className="max-w-7xl mx-auto px-6 py-12 bg-white">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="uppercase text-orange-600 font-medium tracking-widest">
                NEW ARRIVALS
              </p>
              <h2 className="text-4xl font-serif mt-2">Sản phẩm mới</h2>
              <p className="mt-4 text-gray-600 text-[15px]">
                Vừa mới về gần đây
              </p>
              <Link
                href="/product?is_new=true"
                className="mt-6 inline-block text-rose-600 hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="md:col-span-9">
              <Carousel opts={{ align: "start" }}>
                <CarouselContent className="-ml-3">
                  {newProducts.map((p) => (
                    <CarouselItem
                      key={p.id}
                      className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                    >
                      <ProductCard product={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

        {/* ==================== FEATURED ==================== */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="uppercase text-amber-600 font-medium tracking-widest">
                ONLY IN CHOCO
              </p>
              <h2 className="text-4xl font-serif mt-2">Nổi bật</h2>
              <p className="mt-4 text-gray-600 text-[15px]">
                Những sản phẩm đặc biệt chỉ có tại đây
              </p>
              <Link
                href="/product?is_featured=true"
                className="mt-6 inline-block text-rose-600 hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="md:col-span-9">
              <Carousel opts={{ align: "start" }}>
                <CarouselContent className="-ml-3">
                  {featured.map((p) => (
                    <CarouselItem
                      key={p.id}
                      className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                    >
                      <ProductCard product={p} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
