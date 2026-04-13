"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import { useRef, useState } from "react";
import Link from "next/link";


export default function Home() {
   const banners = [
    {
      id: "bn1",
      description: "Sale KitKat up to 20%",
      image_url: "https://picsum.photos/800/300?1",
      link: "/products?p=p1",
      product_id: "p1",
      is_active: true,
      created_at: "2026-03-01",
    },
    {
      id: "bn2",
      description: "Oreo special offer",
      image_url: "https://picsum.photos/800/300?2",
      link: "/products?p=p3",
      product_id: "p3",
      is_active: true,
      created_at: "2026-03-01",
    },
    {
      id: "bn3",
      description: "Snickers hot deal",
      image_url: "https://picsum.photos/800/300?3",
      link: "/products?p=p5",
      product_id: "p5",
      is_active: true,
      created_at: "2026-03-02",
    },
    {
      id: "bn4",
      description: "Chocolate collection",
      image_url: "https://picsum.photos/800/300?4",
      link: "/products?category=c1",
      product_id: null,
      is_active: true,
      created_at: "2026-03-02",
    },
    {
      id: "bn5",
      description: "Cookies & Biscuits",
      image_url: "https://picsum.photos/800/300?5",
      link: "/products?category=c2",
      product_id: null,
      is_active: true,
      created_at: "2026-03-02",
    },
    {
      id: "bn6",
      description: "Snack sale weekend",
      image_url: "https://picsum.photos/800/300?6",
      link: "/products?category=c3",
      product_id: null,
      is_active: true,
      created_at: "2026-03-03",
    },
    {
      id: "bn7",
      description: "Limited KitKat combo",
      image_url: "https://picsum.photos/800/300?7",
      link: "/products?p=p2",
      product_id: "p2",
      is_active: true,
      created_at: "2026-03-03",
    },
    {
      id: "bn8",
      description: "Best seller Oreo",
      image_url: "https://picsum.photos/800/300?8",
      link: "/products?p=p4",
      product_id: "p4",
      is_active: true,
      created_at: "2026-03-03",
    },
    {
      id: "bn9",
      description: "Gummy candy for kids",
      image_url: "https://picsum.photos/800/300?9",
      link: "/products?p=p7",
      product_id: "p7",
      is_active: false, // test inactive
      created_at: "2026-03-04",
    },
    {
      id: "bn10",
      description: "Hot chips deal",
      image_url: "https://picsum.photos/800/300?10",
      link: "/products?p=p8",
      product_id: "p8",
      is_active: true,
      created_at: "2026-03-04",
    },
  ];
  const activeBanners = banners.filter((b) => b.is_active);

  const [current, setCurrent] = useState(0);

  const plugin = useRef(
    Autoplay({
      delay: 5000,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    }),
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-6xl py-10 px-4">
        <h1 className="mb-6 text-3xl font-semibold text-black dark:text-white">
          Home
        </h1>

        {/* BANNER CAROUSEL */}
        <div className="mb-10 relative w-full">
          <Carousel
            plugins={[plugin.current]}
            opts={{ loop: true }}
            setApi={(api) => {
              if (!api) return;
              api.on("select", () => {
                setCurrent(api.selectedScrollSnap());
              });
            }}
          >
            <CarouselContent>
              {activeBanners.map((banner, index) => (
                <CarouselItem key={banner.id}>
                  <Link
                    href={
                      banner.product_id
                        ? `/product/${banner.product_id}`
                        : banner.link || "/"
                    }
                  >
                    <div className="relative overflow-hidden rounded-2xl border shadow-sm cursor-pointer">
                      {/* IMAGE */}
                      <img
                        src={banner.image_url}
                        alt={banner.description || "banner"}
                        className="
  w-full 
  h-[35vh] 
  md:h-[45vh] 
  lg:h-[50vh] 
  object-cover
"
                      />

                      {/* OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* TEXT */}
                      {banner.description && (
                        <div className="absolute bottom-4 left-4 text-white text-sm md:text-lg font-medium">
                          {banner.description}
                        </div>
                      )}
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          {/* 🔵 DOT INDICATOR */}
          <div className="flex justify-center gap-2 mt-4">
            {activeBanners.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  current === index ? "bg-black w-4" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
