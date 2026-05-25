"use client";

import { useState, useEffect, useRef } from "react";

const stats = [
  { value: "100%", label: "Nguyên liệu tươi mỗi ngày" },
  { value: "500+", label: "Mẫu bánh độc quyền" },
  { value: "5★", label: "Đánh giá từ khách hàng" },
  { value: "2h", label: "Giao hàng hỏa tốc nội thành" },
];

const values = [
  {
    num: "01",
    title: "Tươi Mới",
    desc: "Mỗi chiếc bánh được làm trong ngày, không chất bảo quản. Chúng tôi tin rằng sự tươi mới là nguyên liệu quan trọng nhất.",
    icon: "✦",
  },
  {
    num: "02",
    title: "Thủ Công",
    desc: "Bàn tay nghệ nhân tạo nên từng đường nét. Socola được tempering đúng chuẩn, bánh kem được trang trí tỉ mỉ từng chi tiết.",
    icon: "◈",
  },
  {
    num: "03",
    title: "Sáng Tạo",
    desc: "Không ngừng đổi mới. Từ những hương vị truyền thống đến những kết hợp bất ngờ — mỗi mùa là một bộ sưu tập mới.",
    icon: "◇",
  },
  {
    num: "04",
    title: "Tận Tâm",
    desc: "Mỗi đơn hàng đều được chúng tôi đối xử như một tác phẩm nghệ thuật. Dù sinh nhật hay quà tặng — đều trọn vẹn như nhau.",
    icon: "❋",
  },
];

const timeline = [
  { year: "2020", event: "Ra đời từ căn bếp nhỏ ở Quận 3, TP.HCM" },
  { year: "2021", event: "Mở rộng dòng socola thủ công artisan đầu tiên" },
  { year: "2022", event: "Hơn 1.000 chiếc bánh kem thiết kế riêng được giao" },
  { year: "2023", event: "Giới thiệu dịch vụ giao hàng hỏa tốc nội thành" },
  { year: "2024", event: "Ra mắt website và mở rộng danh mục sản phẩm" },
];

export default function AboutUs() {
  const [visible, setVisible] = useState({});
  const refs = useRef({});

  useEffect(() => {
    const observers = {};
    Object.entries(refs.current).forEach(([key, el]) => {
      if (!el) return;
      observers[key] = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisible((v) => ({ ...v, [key]: true }));
        },
        { threshold: 0.15 },
      );
      observers[key].observe(el);
    });
    return () => Object.values(observers).forEach((o) => o.disconnect());
  }, []);

  const setRef = (key) => (el) => {
    refs.current[key] = el;
  };

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', 'Georgia', serif",
        background: "#FAF7F2",
        color: "#2C1810",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.9s cubic-bezier(.22,1,.36,1), transform 0.9s cubic-bezier(.22,1,.36,1);
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-up.delay-1 { transition-delay: 0.1s; }
        .fade-up.delay-2 { transition-delay: 0.2s; }
        .fade-up.delay-3 { transition-delay: 0.3s; }
        .fade-up.delay-4 { transition-delay: 0.4s; }

        .hero-marquee {
          display: flex;
          gap: 3rem;
          animation: marquee 20s linear infinite;
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .value-card {
          border: 1px solid #E8D5C0;
          padding: 2.5rem;
          transition: all 0.4s ease;
          background: #FFFCF8;
          position: relative;
          overflow: hidden;
        }
        .value-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #A0522D08, #C8955808);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .value-card:hover::before { opacity: 1; }
        .value-card:hover {
          border-color: #A0522D;
          transform: translateY(-4px);
          box-shadow: 0 20px 60px #A0522D15;
        }

        .stat-item {
          text-align: center;
          padding: 2rem;
          border-right: 1px solid #E8D5C0;
        }
        .stat-item:last-child { border-right: none; }

        .timeline-item {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          padding: 1.5rem 0;
          border-bottom: 1px solid #E8D5C020;
        }
        .timeline-item:last-child { border-bottom: none; }

        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .sans { font-family: 'DM Sans', sans-serif; }

        @media (max-width: 768px) {
          .hero-title { font-size: clamp(3rem, 15vw, 6rem) !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .values-grid { grid-template-columns: 1fr !important; }
          .story-grid { grid-template-columns: 1fr !important; }
          .stat-item { border-right: none; border-bottom: 1px solid #E8D5C0; }
          .stat-item:last-child { border-bottom: none; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 0 4rem",
          position: "relative",
          background: "#1A0E08",
          overflow: "hidden",
        }}
      >
        {/* Background image placeholder */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('[HERO_IMAGE_URL]')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35,
          }}
        />

        {/* Grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />

        {/* Decorative gold line */}
        <div
          style={{
            position: "absolute",
            top: "3rem",
            left: "3rem",
            right: "3rem",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, #C89558, transparent)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, padding: "0 4vw" }}>
          <p
            className="sans"
            style={{
              color: "#C89558",
              letterSpacing: "0.4em",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              marginBottom: "2rem",
            }}
          >
            Thành lập tại TP.HCM — Từ niềm đam mê
          </p>

          <h1
            className="hero-title serif"
            style={{
              fontSize: "clamp(4rem, 12vw, 9rem)",
              fontWeight: 900,
              color: "#FAF7F2",
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
            }}
          >
            CHOCO
            <br />
            <em style={{ color: "#C89558", fontStyle: "italic" }}>Kingdom</em>
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: "3rem",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <p
              className="sans"
              style={{
                color: "#FAF7F250",
                fontSize: "1rem",
                maxWidth: "380px",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              Vương quốc của những hương vị ngọt ngào — nơi mỗi viên socola và
              từng chiếc bánh kem đều kể một câu chuyện.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                color: "#C89558",
                fontSize: "0.75rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
              className="sans"
            >
              <div
                style={{ width: "3rem", height: "1px", background: "#C89558" }}
              />
              Cuộn để khám phá
            </div>
          </div>
        </div>

        {/* Bottom marquee */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: "1px solid #C8955830",
            padding: "0.8rem 0",
            overflow: "hidden",
          }}
        >
          <div className="hero-marquee">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="sans"
                style={{
                  color: "#C8955860",
                  fontSize: "0.65rem",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                }}
              >
                Socola Thủ Công &nbsp;✦&nbsp; Bánh Kem Nghệ Thuật &nbsp;✦&nbsp;
                Bánh Kẹo Tuyển Chọn &nbsp;✦&nbsp; Giao Hàng Nội Thành
                &nbsp;✦&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#2C1810", padding: "0" }}>
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="stat-item"
              style={{ borderColor: "#C8955830" }}
            >
              <div
                className="serif"
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "#C89558",
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}
              >
                {s.value}
              </div>
              <div
                className="sans"
                style={{
                  color: "#FAF7F260",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ padding: "8rem 4vw" }}>
        <div
          className="story-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6rem",
            maxWidth: "1200px",
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          <div
            ref={setRef("story")}
            className={`fade-up${visible.story ? " visible" : ""}`}
          >
            <p
              className="sans"
              style={{
                color: "#C89558",
                letterSpacing: "0.3em",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              Câu chuyện của chúng tôi
            </p>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: "2rem",
              }}
            >
              Sinh ra từ{" "}
              <em style={{ color: "#A0522D", fontStyle: "italic" }}>
                niềm đam mê
              </em>
              <br />
              với đồ ngọt
            </h2>
            <p
              className="sans"
              style={{
                color: "#2C181070",
                lineHeight: 1.9,
                fontSize: "1rem",
                marginBottom: "1.5rem",
                fontWeight: 300,
              }}
            >
              Choco Kingdom ra đời từ một căn bếp nhỏ ở Quận 3, TP.HCM — nơi
              người sáng lập dành hàng giờ thử nghiệm công thức socola, học cách
              temper từ những video nước ngoài và mơ về một vương quốc ngọt ngào
              của riêng mình.
            </p>
            <p
              className="sans"
              style={{
                color: "#2C181070",
                lineHeight: 1.9,
                fontSize: "1rem",
                fontWeight: 300,
              }}
            >
              Chúng tôi không chỉ bán bánh. Chúng tôi bán những khoảnh khắc —
              sinh nhật đáng nhớ, lời cảm ơn từ trái tim, và những buổi sáng thứ
              Bảy thật ngọt ngào.
            </p>
          </div>

          {/* Image placeholder */}
          <div
            ref={setRef("storyImg")}
            className={`fade-up delay-2${visible.storyImg ? " visible" : ""}`}
            style={{ position: "relative" }}
          >
            <div
              style={{
                aspectRatio: "4/5",
                background: "#E8D5C0",
                borderRadius: "2px",
                backgroundImage: "url('[STORY_IMAGE_URL]')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Floating badge */}
            <div
              style={{
                position: "absolute",
                bottom: "-1.5rem",
                left: "-1.5rem",
                background: "#C89558",
                color: "#FAF7F2",
                padding: "1.5rem",
                borderRadius: "2px",
                textAlign: "center",
              }}
            >
              <div
                className="serif"
                style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}
              >
                Made
              </div>
              <div
                className="sans"
                style={{
                  fontSize: "0.6rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                in Saigon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section
        style={{
          background: "#FAF0E4",
          padding: "8rem 4vw",
          borderTop: "1px solid #E8D5C0",
          borderBottom: "1px solid #E8D5C0",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            ref={setRef("valTitle")}
            className={`fade-up${visible.valTitle ? " visible" : ""}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "4rem",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <h2
              className="serif"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
              }}
            >
              Những giá trị
              <br />
              <em style={{ color: "#A0522D" }}>cốt lõi</em>
            </h2>
            <p
              className="sans"
              style={{
                color: "#2C181060",
                maxWidth: "300px",
                lineHeight: 1.7,
                fontSize: "0.9rem",
                fontWeight: 300,
              }}
            >
              Bốn nguyên tắc dẫn đường cho mọi sản phẩm chúng tôi tạo ra.
            </p>
          </div>

          <div
            className="values-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
            }}
          >
            {values.map((v, i) => (
              <div
                key={i}
                ref={setRef(`val${i}`)}
                className={`value-card fade-up delay-${i + 1}${visible[`val${i}`] ? " visible" : ""}`}
              >
                <div
                  className="serif"
                  style={{
                    fontSize: "2rem",
                    color: "#C89558",
                    marginBottom: "1rem",
                  }}
                >
                  {v.icon}
                </div>
                <div
                  className="sans"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.3em",
                    color: "#A0522D80",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                  }}
                >
                  {v.num}
                </div>
                <h3
                  className="serif"
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  className="sans"
                  style={{
                    color: "#2C181060",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION ── */}
      <section style={{ padding: "8rem 4vw", background: "#2C1810" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
          }}
          className="story-grid"
        >
          {[
            {
              tag: "Sứ mệnh",
              title: "Gói trọn yêu thương trong từng sản phẩm",
              desc: "Mỗi chiếc bánh kem, mỗi viên socola xuất kho đều được làm ra bằng sự tỉ mỉ và tình yêu nghề. Chúng tôi là người đưa tin cho những cảm xúc ngọt ngào nhất.",
            },
            {
              tag: "Tầm nhìn",
              title: "Biểu tượng quà tặng ngọt ngào của TP.HCM",
              desc: "Chúng tôi mơ đến một ngày cái tên Choco Kingdom đồng nghĩa với những khoảnh khắc hạnh phúc nhất trong cuộc sống của mỗi gia đình Việt.",
            },
          ].map((item, i) => (
            <div
              key={i}
              ref={setRef(`mv${i}`)}
              className={`fade-up delay-${i + 1}${visible[`mv${i}`] ? " visible" : ""}`}
              style={{
                borderTop: "1px solid #C8955840",
                paddingTop: "2.5rem",
              }}
            >
              <span
                className="sans"
                style={{
                  color: "#C89558",
                  fontSize: "0.65rem",
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "1.5rem",
                }}
              >
                {item.tag}
              </span>
              <h3
                className="serif"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#FAF7F2",
                  marginBottom: "1rem",
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </h3>
              <p
                className="sans"
                style={{
                  color: "#FAF7F250",
                  lineHeight: 1.8,
                  fontSize: "0.9rem",
                  fontWeight: 300,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding: "8rem 4vw" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            ref={setRef("tl")}
            className={`fade-up${visible.tl ? " visible" : ""}`}
            style={{ marginBottom: "4rem" }}
          >
            <p
              className="sans"
              style={{
                color: "#C89558",
                letterSpacing: "0.3em",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Hành trình
            </p>
            <h2
              className="serif"
              style={{ fontSize: "2.5rem", fontWeight: 700 }}
            >
              Từ căn bếp nhỏ đến{" "}
              <em style={{ color: "#A0522D" }}>vương quốc</em>
            </h2>
          </div>

          {timeline.map((t, i) => (
            <div
              key={i}
              ref={setRef(`tl${i}`)}
              className={`timeline-item fade-up delay-${(i % 4) + 1}${visible[`tl${i}`] ? " visible" : ""}`}
              style={{ borderColor: "#E8D5C0" }}
            >
              <div
                className="serif"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#C89558",
                  minWidth: "4rem",
                }}
              >
                {t.year}
              </div>
              <div
                className="sans"
                style={{
                  color: "#2C181080",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  fontWeight: 300,
                }}
              >
                {t.event}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ETHICS ── */}
      <section
        style={{
          background: "#F5EDE0",
          padding: "8rem 4vw",
          borderTop: "1px solid #E8D5C0",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            ref={setRef("eth")}
            className={`fade-up${visible.eth ? " visible" : ""}`}
            style={{ textAlign: "center", marginBottom: "5rem" }}
          >
            <p
              className="sans"
              style={{
                color: "#C89558",
                letterSpacing: "0.3em",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Đạo đức kinh doanh
            </p>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Chúng tôi kinh doanh bằng{" "}
              <em style={{ color: "#A0522D" }}>lương tâm</em>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1px",
              background: "#E8D5C0",
            }}
            className="values-grid"
          >
            {[
              {
                icon: "◆",
                title: "Chính trực",
                desc: "Tuyệt đối không thỏa hiệp về chất lượng. Mọi nguyên liệu đều có nguồn gốc rõ ràng, không chất bảo quản độc hại.",
              },
              {
                icon: "◉",
                title: "Minh bạch",
                desc: "Thành phần, hạn sử dụng, chính sách — tất cả được công khai. Hình ảnh quảng cáo và sản phẩm thực tế luôn đồng nhất.",
              },
              {
                icon: "❖",
                title: "Bền vững",
                desc: "Sử dụng bao bì thân thiện môi trường, giảm thiểu rác thải nhựa trong từng đơn hàng chúng tôi giao.",
              },
            ].map((e, i) => (
              <div
                key={i}
                ref={setRef(`eth${i}`)}
                className={`fade-up delay-${i + 1}${visible[`eth${i}`] ? " visible" : ""}`}
                style={{
                  background: "#FAF7F2",
                  padding: "3rem",
                  textAlign: "center",
                }}
              >
                <div
                  className="serif"
                  style={{
                    fontSize: "1.5rem",
                    color: "#C89558",
                    marginBottom: "1.5rem",
                  }}
                >
                  {e.icon}
                </div>
                <h3
                  className="serif"
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  {e.title}
                </h3>
                <p
                  className="sans"
                  style={{
                    color: "#2C181060",
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE / CTA ── */}
      <section
        style={{
          background: "#1A0E08",
          padding: "10rem 4vw",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60vmax",
            height: "60vmax",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #C8955808 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            className="serif"
            style={{
              fontSize: "4rem",
              color: "#C89558",
              opacity: 0.3,
              marginBottom: "2rem",
            }}
          >
            "
          </div>
          <p
            className="serif"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              color: "#FAF7F2",
              fontStyle: "italic",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.5,
              marginBottom: "3rem",
            }}
          >
            Sứ mệnh của chúng tôi là biến thế giới trở nên ngọt ngào hơn, bắt
            đầu từ những nụ cười của khách hàng tại TP. Hồ Chí Minh.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{ width: "3rem", height: "1px", background: "#C89558" }}
            />
            <span
              className="sans"
              style={{
                color: "#C89558",
                fontSize: "0.65rem",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
              }}
            >
              Choco Kingdom
            </span>
            <div
              style={{ width: "3rem", height: "1px", background: "#C89558" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
