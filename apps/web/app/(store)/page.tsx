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
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen  ">
      <main>
        {/* ==================== HERO SECTION ==================== */}
        {/* <div className="relative bg-gradient-to-br from-[#3b1d14] via-[#5c2f1f] to-[#3b1d14] text-white overflow-hidden">
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
        </div> */}

        {/* ==================== BANNER CAROUSEL ==================== */}
        {banners.length > 0 && (
          <div className="w-full relative z-10 pb-5">
            <div className="relative">
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
                                "https://picsum.photos/1600/800?random=88";
                            }}
                          />

                          {/* Overlay tối */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#2b0f08]/90 via-[#3b1209]/70 to-transparent" />
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 border border-white/30 text-white hover:bg-white hover:text-black backdrop-blur-md" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 border border-white/30 text-white hover:bg-white hover:text-black backdrop-blur-md" />
              </Carousel>

              {/* TEXT LEFT */}
              <div className="absolute inset-0 flex items-center z-20 ">
                <div className="ml-6 md:ml-20 max-w-2xl text-white ">
                  {/* Welcome */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-[1px] bg-[#f5d9b0]" />
                    <p className="uppercase tracking-[6px] text-[#f5d9b0] text-xs md:text-sm">
                      Chào mừng đến với
                    </p>
                    <div className="w-10 h-[1px] bg-[#f5d9b0]" />
                  </div>

                  {/* Title */}
                  <h1 className="leading-none">
                    <span className="block text-4xl md:text-6xl lg:text-4xl tracking-wide">
                      VƯƠNG QUỐC
                    </span>
                    <span className="block mt-2 mx-5 text-5xl md:text-7xl lg:text-6xl bg-gradient-to-r from-[#ffd6df] via-[#ff9eb5] to-[#ffe5ea] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,180,200,0.5)]">
                      KẸO NGỌT
                    </span>
                    <span className="block mt-2 mx-15 text-5xl md:text-7xl lg:text-6xl bg-gradient-to-r from-[#f5d9b0] via-[#f3c67a] to-[#f5d9b0] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,220,170,0.5)]">
                      SWEPI
                    </span>
                    <div className="w-[90%] h-[1px] bg-[#f5d9b0] my-6"></div>
                  </h1>

                  {/* Description */}
                  <p className="mt-6 text-sm md:text-xl text-gray-200 max-w-lg leading-relaxed">
                    Chạm đến hạnh phúc trong từng hương vị ngọt ngào
                  </p>

                  {/* Button */}
                  <Link href="/product">
                    <button className="mt-8 px-8 py-4 rounded-full bg-gradient-to-r from-[#ffe3b3] to-[#f3c67a] text-[#3b1d14] font-semibold text-lg shadow-[0_10px_30px_rgba(255,220,170,0.4)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,220,170,0.6)] transition-all duration-300">
                      KHÁM PHÁ NGAY →
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* DOT */}
            <div className="flex justify-center gap-3 mt-5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`rounded-full transition-all duration-300 ${
                    current === index
                      ? "bg-[#FF5FA2] w-8 h-2.5"
                      : "bg-gray-400/50 w-2.5 h-2.5 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ==================== BEST SELLERS ==================== */}
        <section className="w-[95%] mx-auto px-6 py-6 mb-3 border border-white ">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="uppercase text-rose-600 font-medium tracking-widest">
                nổi bật
              </p>
              <h2 className="text-3xl font-serif mt-2"> Sản phẩm bán chạy</h2>
              <div className="w-16 h-[2px] bg-rose-500 my-6"></div>
              <p className="mt-4 text-gray-600 text-[15px]">
                Những sản phẩm bán chạy nhất tháng này với giá ưu đãi hấp dẫn.
              </p>
              <Button className="mt-6 px-3 bg-[#FF4D94] ">
                <Link
                  href="/product?is_best_seller=true"
                  className="text-[#4A2C35] hover:underline hover:text-white font-medium hover:font-bold"
                >
                  Xem tất cả →
                </Link>
              </Button>
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
        <section className="mx-auto px-6 py-6 mb-3 border border-white bg-[#FFF0F6]">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="uppercase text-orange-600 font-medium tracking-widest">
                MỚI VỀ
              </p>
              <h2 className="text-4xl font-serif mt-2">Sản phẩm mới</h2>
              <div className="w-16 h-[2px] bg-rose-500 my-6"></div>
              <p className="mt-4 text-gray-600 text-[15px]">
                Những sản phẩm vừa được cập nhật gần đây
              </p>
              <Button className="mt-6 px-3 bg-[#FF4D94] ">
                <Link
                  href="/product?is_new=true"
                  className="text-[#4A2C35] hover:underline hover:text-white font-medium hover:font-bold"
                >
                  Xem tất cả →
                </Link>
              </Button>
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
        {/* <section className="w-[90%] mx-auto px-6 py-6 mb-3 border border-white rounded-3xl bg-gray-100 ">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <p className="uppercase text-amber-600 font-medium tracking-widest">
                Đặc biệt
              </p>
              <h2 className="text-3xl font-serif mt-2">Sản phẩm cho bạn</h2>
              <div className="w-16 h-[2px] bg-rose-500 my-6"></div>
              <p className="mt-4 text-gray-600 text-[15px]">
                Những sản phẩm được chọn lọc dành riêng cho bạn
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
        </section> */}

        {/* ==================== END OF PAGE ==================== */}
        <section className="mx-auto px-6 py-6 mb-3 border border-white rounded-3xl">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {/* Item 1 */}
              <div className="group flex flex-col items-center cursor-pointer">
                <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-lg mb-8 transition-all duration-300 group-hover:bg-[#FF5FA2]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-black transition-colors duration-300 group-hover:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {/* Candy Icon */}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10a4 4 0 118 0c1.657 0 3 1.343 3 3v1H5v-1c0-1.657 1.343-3 3-3zm1 4h6v3a3 3 0 11-6 0v-3z"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-[3px] text-black mb-4">
                  HƯƠNG VỊ NGỌT NGÀO
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
                  Mang đến những món ngọt thơm ngon giúp mỗi khoảnh khắc thêm
                  trọn vẹn.
                </p>
              </div>

              {/* Item 2 */}
              <div className="group flex flex-col items-center cursor-pointer">
                <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-lg mb-8 transition-all duration-300 group-hover:bg-[#FF5FA2]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-black transition-colors duration-300 group-hover:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {/* Gift Icon */}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v13m-7-9h14M5 8h14v4H5V8zm3-3a2 2 0 014 0c0 1.5-2 3-2 3s-2-1.5-2-3zm6 0a2 2 0 014 0c0 1.5-2 3-2 3s-2-1.5-2-3z"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-[3px] text-black mb-4">
                  QUÀ TẶNG Ý NGHĨA
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
                  Những hộp quà bánh kẹo tinh tế dành cho người thân và bạn bè.
                </p>
              </div>

              {/* Item 3 */}
              <div className="group flex flex-col items-center cursor-pointer">
                <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-lg mb-8 transition-all duration-300 group-hover:bg-[#FF5FA2]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-black transition-colors duration-300 group-hover:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h8m-8 4h5m-9 6l2.5-2.5A2 2 0 015 17h11a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h.5L3 20z"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-[3px] text-black mb-4">
                  HỖ TRỢ 24/7
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
                  Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ mọi lúc.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
