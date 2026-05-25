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

const homeStyles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --choco: #2b1209;
  --choco-mid: #5c2a14;
  --rose: #e8336d;
  --rose-soft: #fde8f0;
  --rose-border: #f9b8d0;
  --gold: #c9893a;
  --gold-light: #f5d9a0;
  --gold-soft: #fdf5e6;
  --cream: #fdf8f3;
  --mint: #f0faf4;
  --ink: #1a0a05;
  --ink-2: #5a3626;
  --ink-3: #9a7060;
  --ink-4: #c8b0a0;
  --white: #ffffff;
  --f-display: 'Cormorant Garamond', Georgia, serif;
  --f-body: 'DM Sans', system-ui, sans-serif;
}

.home-root { font-family: var(--f-body); background: var(--cream); }

/* ── Spinner ── */
.home-loader { min-height:70vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; background:var(--cream); }
.home-spinner { width:44px; height:44px; border:3px solid var(--rose-border); border-top-color:var(--rose); border-radius:50%; animation:spin 0.75s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.home-loader p { font-family:var(--f-body); font-size:14px; color:var(--ink-3); font-weight:500; }

/* ── Section labels ── */
.sec-eyebrow {
  display:inline-flex; align-items:center; gap:8px;
  font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase;
  font-family:var(--f-body);
}
.sec-eyebrow::before, .sec-eyebrow::after {
  content:''; display:block; height:1px; width:24px;
}

/* ── "View all" link ── */
.view-all-link {
  display:inline-flex; align-items:center; gap:6px;
  font-size:13px; font-weight:600; font-family:var(--f-body);
  text-decoration:none; padding:9px 20px;
  border-radius:100px;
  transition:all 0.18s;
}

/* ── SECTION 1: Best Sellers — dark chocolate card ── */
.s1 {
  background: linear-gradient(160deg, #2b1209 0%, #3e1a0e 55%, #2b1209 100%);
  position:relative; overflow:hidden;
  padding: 70px 0 80px;
}
.s1::before {
  content:'';
  position:absolute; inset:0;
  background:
    radial-gradient(ellipse 60% 50% at 85% 50%, rgba(201,137,58,0.08) 0%, transparent 70%),
    radial-gradient(ellipse 40% 60% at 10% 80%, rgba(232,51,109,0.07) 0%, transparent 70%);
  pointer-events:none;
}
/* subtle dot pattern */
.s1::after {
  content:'';
  position:absolute; inset:0;
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size:28px 28px;
  pointer-events:none;
}
.s1-inner { max-width:1280px; margin:0 auto; padding:0 32px; position:relative; z-index:1; }
.s1-head { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:36px; gap:20px; flex-wrap:wrap; }
.s1-eyebrow { color:var(--gold-light); }
.s1-eyebrow::before, .s1-eyebrow::after { background:var(--gold-light); opacity:0.4; }
.s1-title {
  font-family:var(--f-display);
  font-size:clamp(32px,4vw,52px);
  font-weight:600; color:#fff;
  margin:10px 0 0; line-height:1.1;
  letter-spacing:-0.01em;
}
.s1-title em { font-style:italic; color:var(--gold-light); }
.s1-desc { color:rgba(255,255,255,0.55); font-size:14px; margin:10px 0 0; max-width:260px; line-height:1.6; }
.s1-viewall { background:rgba(255,255,255,0.08); color:#fff; border:1.5px solid rgba(255,255,255,0.15); }
.s1-viewall:hover { background:var(--gold); color:var(--choco); border-color:var(--gold); }
.s1-carousel-wrap { position:relative; }

/* ── SECTION 2: New Arrivals — fresh light layout ── */
.s2 {
  background:#fff;
  padding: 80px 0 90px;
  position:relative;
}
.s2::before {
  content:'';
  position:absolute; top:0; left:0; right:0; height:4px;
  background:linear-gradient(90deg, var(--rose) 0%, var(--gold) 50%, var(--rose) 100%);
}
.s2-inner { max-width:1280px; margin:0 auto; padding:0 32px; }
.s2-layout { display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; gap:0; }
.s2-head-col {
  grid-column:1 / 2;
  display:flex; flex-direction:column; justify-content:center;
  padding-right:32px;
  border-right:1px solid #f0e8e0;
}
.s2-carousel-col { grid-column:2 / 6; padding-left:32px; }
.s2-eyebrow { color:var(--rose); }
.s2-eyebrow::before, .s2-eyebrow::after { background:var(--rose); opacity:0.35; }
.s2-title {
  font-family:var(--f-display);
  font-size:clamp(28px,3.5vw,46px);
  font-weight:600; color:var(--ink);
  margin:10px 0 0; line-height:1.12; letter-spacing:-0.01em;
}
.s2-title em { font-style:italic; color:var(--rose); }
.s2-desc { color:var(--ink-3); font-size:14px; margin:12px 0 0; line-height:1.65; }
.s2-viewall { margin-top:22px; background:var(--rose); color:#fff; border:none; }
.s2-viewall:hover { background:#c0295a; transform:translateY(-1px); box-shadow:0 6px 20px rgba(232,51,109,0.3); }
/* Badge NEW on product card — inject via CSS sibling trick if not in ProductCard */
.s2-new-tag {
  display:inline-block; font-size:10px; font-weight:700; letter-spacing:0.08em;
  background:var(--rose); color:#fff; padding:3px 8px; border-radius:4px;
  margin-bottom:6px; font-family:var(--f-body);
}

/* ── SECTION 3: Featured — editorial asymmetric ── */
.s3 {
  background:linear-gradient(135deg, #fdf5e6 0%, #fde8f0 50%, #fdf5e6 100%);
  padding: 80px 0 90px;
  position:relative; overflow:hidden;
}
.s3::before {
  content:'★';
  position:absolute; right:-40px; top:-40px;
  font-size:300px; color:rgba(201,137,58,0.05);
  line-height:1; pointer-events:none; user-select:none;
  font-family:serif;
}
.s3-inner { max-width:1280px; margin:0 auto; padding:0 32px; position:relative; z-index:1; }
.s3-head { text-align:center; margin-bottom:48px; }
.s3-eyebrow { color:var(--gold); justify-content:center; }
.s3-eyebrow::before, .s3-eyebrow::after { background:var(--gold); opacity:0.4; }
.s3-title {
  font-family:var(--f-display);
  font-size:clamp(32px,4vw,56px);
  font-weight:600; color:var(--ink);
  margin:10px 0 0; line-height:1.1; letter-spacing:-0.01em;
}
.s3-title em { font-style:italic; color:var(--gold); }
.s3-desc { color:var(--ink-3); font-size:14.5px; margin:12px auto 0; max-width:460px; line-height:1.65; }
.s3-viewall {
  display:inline-flex; margin-top:20px;
  background:transparent; color:var(--gold);
  border:2px solid var(--gold);
}
.s3-viewall:hover { background:var(--gold); color:#fff; }
.s3-grid {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:20px;
}
@media(max-width:1100px) { .s3-grid { grid-template-columns:repeat(4,1fr); } }
@media(max-width:800px) {
  .s3-grid { grid-template-columns:repeat(2,1fr); }
  .s2-layout { grid-template-columns:1fr; }
  .s2-head-col { border-right:none; border-bottom:1px solid #f0e8e0; padding-right:0; padding-bottom:24px; margin-bottom:8px; }
  .s2-carousel-col { padding-left:0; }
}

/* ── Features strip ── */
.feat-strip {
  background:#fff;
  border-top:1px solid #f0e8e0; border-bottom:1px solid #f0e8e0;
  padding:50px 32px;
}
.feat-strip-inner {
  max-width:1100px; margin:0 auto;
  display:grid; grid-template-columns:repeat(3,1fr); gap:40px;
}
@media(max-width:700px) { .feat-strip-inner { grid-template-columns:1fr; gap:32px; } }
.feat-item { display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px; }
.feat-icon-ring {
  width:64px; height:64px; border-radius:18px;
  background:var(--cream); border:1.5px solid #f0e4d8;
  display:flex; align-items:center; justify-content:center;
  transition:background 0.2s, border-color 0.2s, transform 0.2s;
}
.feat-item:hover .feat-icon-ring { background:var(--rose); border-color:var(--rose); transform:translateY(-3px); }
.feat-icon-ring svg { width:26px; height:26px; color:var(--ink-2); transition:color 0.2s; }
.feat-item:hover .feat-icon-ring svg { color:#fff; }
.feat-title { font-family:var(--f-display); font-size:18px; font-weight:600; color:var(--ink); letter-spacing:-0.01em; }
.feat-desc { font-size:13.5px; color:var(--ink-3); line-height:1.65; max-width:240px; }

/* ── Carousel arrow overrides ── */
.dark-arrows [data-carousel-prev],
.dark-arrows [data-carousel-next] {
  background:rgba(255,255,255,0.1);
  border:1px solid rgba(255,255,255,0.2);
  color:#fff;
}
.dark-arrows [data-carousel-prev]:hover,
.dark-arrows [data-carousel-next]:hover {
  background:var(--gold); border-color:var(--gold); color:var(--choco);
}

.s1 .ProductCard, 
.s2 .ProductCard, 
.s3 .ProductCard {
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.s3-grid {
  gap: 18px !important;
}
`;

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false }),
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
        setBanners(bannerData || []);
        setBestSellers(bestData.products || []);
        setNewProducts(newData.products || []);
        setFeatured(featuredData.products || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu Home:", err);
        toast.error("Không thể tải một số dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (loading) {
    return (
      <>
        <style>{homeStyles}</style>
        <div className="home-loader">
          <div className="home-spinner" />
          <p>Đang tải...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{homeStyles}</style>
      <div className="home-root">
        <main>

          {banners.length > 0 && (
            <div
              style={{
                width: "100%",
                position: "relative",
                zIndex: 10,
                paddingBottom: 20,
              }}
            >
              <div style={{ position: "relative" }}>
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
                              : (banner as any).link || "#"
                          }
                        >
                          <div
                            style={{ position: "relative", overflow: "hidden" }}
                            className="group"
                          >
                            <img
                              src={banner.image_url || (banner as any).imageUrl}
                              alt={banner.description || "Banner"}
                              style={{
                                width: "100%",
                                height: "clamp(240px,45vw,500px)",
                                objectFit: "cover",
                                transition: "transform 0.7s ease",
                              }}
                              className="group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://picsum.photos/1600/800?random=88";
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(100deg, rgba(27,8,3,0.92) 0%, rgba(43,18,9,0.75) 40%, rgba(43,18,9,0.1) 75%, transparent 100%)",
                              }}
                            />
                          </div>
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious
                    style={{
                      position: "absolute",
                      left: 20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 30,
                      background: "rgba(255,255,255,0.12)",
                      border: "1.5px solid rgba(255,255,255,0.25)",
                      color: "#fff",
                      backdropFilter: "blur(6px)",
                    }}
                  />
                  <CarouselNext
                    style={{
                      position: "absolute",
                      right: 20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 30,
                      background: "rgba(255,255,255,0.12)",
                      border: "1.5px solid rgba(255,255,255,0.25)",
                      color: "#fff",
                      backdropFilter: "blur(6px)",
                    }}
                  />
                </Carousel>

                {/* Banner overlay text */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    zIndex: 20,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      marginLeft: "clamp(24px,6vw,96px)",
                      maxWidth: 580,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 1,
                          background: "#c9893a",
                          opacity: 0.8,
                        }}
                      />
                      <p
                        style={{
                          fontFamily: "var(--f-body)",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "#f5d9a0",
                          margin: 0,
                        }}
                      >
                        Chào mừng đến với
                      </p>
                      <div
                        style={{
                          width: 40,
                          height: 1,
                          background: "#c9893a",
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <h1
                      style={{
                        fontFamily: "var(--f-display)",
                        margin: 0,
                        lineHeight: 1.08,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "clamp(22px,3.5vw,42px)",
                          fontWeight: 400,
                          color: "#fff",
                          letterSpacing: "0.06em",
                        }}
                      >
                        VƯƠNG QUỐC
                      </span>
                      <span
                        style={{
                          display: "block",
                          marginTop: 4,
                          fontSize: "clamp(30px,5.5vw,68px)",
                          fontWeight: 700,
                          fontStyle: "italic",
                          background:
                            "linear-gradient(90deg,#ffd6df,#ff9eb5,#ffe5ea)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 14px rgba(255,160,190,0.4))",
                        }}
                      >
                        KẸO NGỌT
                      </span>
                      <span
                        style={{
                          display: "block",
                          marginTop: 2,
                          fontSize: "clamp(28px,5vw,64px)",
                          fontWeight: 700,
                          background:
                            "linear-gradient(90deg,#f5d9b0,#f3c67a,#f5d9b0)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 12px rgba(243,198,122,0.4))",
                        }}
                      >
                        SWEPI
                      </span>
                    </h1>
                    <div
                      style={{
                        width: "85%",
                        height: 1,
                        background: "rgba(245,217,160,0.3)",
                        margin: "20px 0",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "var(--f-body)",
                        fontSize: "clamp(13px,1.6vw,18px)",
                        color: "rgba(255,255,255,0.72)",
                        margin: 0,
                        lineHeight: 1.65,
                      }}
                    >
                      Chạm đến hạnh phúc trong từng hương vị ngọt ngào
                    </p>
                    <Link href="/product" style={{ pointerEvents: "all" }}>
                      <button
                        style={{
                          marginTop: 28,
                          padding: "12px 32px",
                          borderRadius: 100,
                          background: "linear-gradient(90deg,#ffe3b3,#f3c67a)",
                          border: "none",
                          color: "#3b1d14",
                          fontFamily: "var(--f-body)",
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          cursor: "pointer",
                          boxShadow: "0 10px 30px rgba(243,198,122,0.35)",
                          transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseOver={(e) => {
                          (e.currentTarget as any).style.transform =
                            "translateY(-2px) scale(1.03)";
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as any).style.transform = "none";
                        }}
                      >
                        KHÁM PHÁ NGAY →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    style={{
                      borderRadius: 100,
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      background:
                        current === i ? "var(--rose)" : "rgba(0,0,0,0.15)",
                      width: current === i ? 28 : 8,
                      height: 8,
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 1 — BEST SELLERS (Nổi Bật) */}
          {bestSellers.length > 0 && (
            <section className="s1" style={{ padding: "60px 0 70px" }}>
              <div className="s1-inner">
                <div className="s1-head">
                  <div>
                    <div className="sec-eyebrow s1-eyebrow">
                      🔥 Bán chạy nhất
                    </div>
                    <h2 className="s1-title">
                      Sản phẩm <em>Nổi Bật</em>
                    </h2>
                    <p className="s1-desc">
                      Những lựa chọn được yêu thích nhất tháng này
                    </p>
                  </div>
                  <Link
                    href="/product?is_best_seller=true"
                    className="view-all-link s1-viewall"
                  >
                    Xem tất cả →
                  </Link>
                </div>

                <div className="s1-carousel-wrap dark-arrows">
                  <Carousel opts={{ align: "start" }}>
                    <CarouselContent style={{ marginLeft: -10 }}>
                      {bestSellers.map((p) => (
                        <CarouselItem
                          key={p.id}
                          style={{ paddingLeft: 10 }}
                          className="basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
                        >
                          <ProductCard product={p} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious style={{ left: -12 }} />
                    <CarouselNext style={{ right: -12 }} />
                  </Carousel>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2 — NEW ARRIVALS (Hàng Mới) */}
          {newProducts.length > 0 && (
            <section className="s2" style={{ padding: "70px 0 80px" }}>
              <div className="s2-inner">
                <div className="s2-layout">
                  <div className="s2-head-col">
                    <div className="sec-eyebrow s2-eyebrow">✨ Mới về</div>
                    <h2 className="s2-title">
                      Hàng <em>Mới</em>
                      <br />
                      Vừa Về
                    </h2>
                    <p className="s2-desc">
                      Những sản phẩm vừa được cập nhật, luôn tươi mới và hấp dẫn
                      nhất.
                    </p>
                    <Link
                      href="/product?is_new=true"
                      className="view-all-link s2-viewall"
                    >
                      Xem tất cả →
                    </Link>
                  </div>

                  <div className="s2-carousel-col">
                    <Carousel opts={{ align: "start" }}>
                      <CarouselContent style={{ marginLeft: -10 }}>
                        {newProducts.map((p) => (
                          <CarouselItem
                            key={p.id}
                            style={{ paddingLeft: 10 }}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                          >
                            <ProductCard product={p} />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious style={{ left: -12 }} />
                      <CarouselNext style={{ right: -12 }} />
                    </Carousel>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3 — FEATURED */}
          {featured.length > 0 && (
            <section className="s3" style={{ padding: "70px 0 80px" }}>
              <div className="s3-inner">
                <div className="s3-head">
                  <div className="sec-eyebrow s3-eyebrow">⭐ Đặc biệt</div>
                  <h2 className="s3-title">
                    Dành <em>Riêng</em> Cho Bạn
                  </h2>
                  <p className="s3-desc">
                    Những sản phẩm được chọn lọc kỹ càng, phù hợp với mọi sở
                    thích và dịp đặc biệt.
                  </p>
                  <Link
                    href="/product?is_featured=true"
                    className="view-all-link s3-viewall"
                  >
                    Xem tất cả →
                  </Link>
                </div>

                <div
                  className="s3-grid"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {featured.slice(0, 10).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          <div className="feat-strip">
            <div className="feat-strip-inner">
              <div className="feat-item">
                <div className="feat-icon-ring">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21l-3-9H6l-3 9"
                    />
                  </svg>
                </div>
                <div>
                  <p className="feat-title">Hương Vị Ngọt Ngào</p>
                  <p className="feat-desc">
                    Mang đến những món ngon giúp mỗi khoảnh khắc thêm trọn vẹn.
                  </p>
                </div>
              </div>
              <div className="feat-item">
                <div className="feat-icon-ring">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                    />
                  </svg>
                </div>
                <div>
                  <p className="feat-title">Quà Tặng Ý Nghĩa</p>
                  <p className="feat-desc">
                    Hộp quà bánh kẹo tinh tế, sang trọng dành cho người thân
                    yêu.
                  </p>
                </div>
              </div>
              <div className="feat-item">
                <div className="feat-icon-ring">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="feat-title">Hỗ Trợ 24/7</p>
                  <p className="feat-desc">
                    Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ mọi lúc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
