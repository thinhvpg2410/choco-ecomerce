import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #2c1509 0%, #1a0c04 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        .ftr-root * { box-sizing: border-box; }
        .ftr-root a { text-decoration: none; }
        .ftr-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 13px;
          color: #c9922a;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(201,146,42,0.2);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ftr-heading::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 14px;
          background: #c9922a;
          border-radius: 2px;
        }
        .ftr-link {
          display: block;
          font-size: 13.5px;
          color: rgba(255,255,255,0.55);
          padding: 5px 0;
          transition: color 0.18s, padding-left 0.18s;
          cursor: pointer;
          font-weight: 300;
        }
        .ftr-link:hover { color: #e7c27d; padding-left: 4px; }
        .ftr-social {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.55);
          font-size: 13.5px;
          font-weight: 300;
          transition: background 0.18s, color 0.18s, border-color 0.18s;
          cursor: pointer;
          margin-bottom: 8px;
        }
        .ftr-social:hover { background: rgba(231,194,125,0.08); color: #e7c27d; border-color: rgba(231,194,125,0.2); }
        .ftr-social img { width: 18px; height: 18px; object-fit: contain; opacity: 0.7; filter: brightness(1.2); }
        .ftr-social:hover img { opacity: 1; }
      `}</style>

      <div className="ftr-root">
        {/* Top decorative line */}
        <div
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, #c9922a 30%, #e7c27d 50%, #c9922a 70%, transparent 100%)",
          }}
        />

        {/* Brand hero */}
        <div style={{ textAlign: "center", padding: "44px 24px 36px" }}>
          {/* Small icon row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                height: 1,
                width: 48,
                background:
                  "linear-gradient(90deg, transparent, rgba(201,146,42,0.5))",
              }}
            />
            <div
              style={{
                height: 1,
                width: 48,
                background:
                  "linear-gradient(90deg, rgba(201,146,42,0.5), transparent)",
              }}
            />
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(36px, 6vw, 52px)",
              color: "#e7c27d",
              letterSpacing: "-0.01em",
              marginBottom: 8,
              lineHeight: 1,
            }}
          >
            Choco Kingdom
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 300,
            }}
          >
            Vương quốc của những hương vị ngọt ngào
          </p>
        </div>

        {/* Thin divider */}
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto 36px",
            height: 1,
            background: "rgba(255,255,255,0.06)",
          }}
        />

        {/* Links grid */}
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "32px 40px",
            padding: "0 32px 48px",
          }}
        >
          <div>
            <div className="ftr-heading">Sản phẩm</div>
            <Link href="/products/socola" className="ftr-link">
              Socola
            </Link>
            <Link href="/products/keo" className="ftr-link">
              Kẹo
            </Link>
            <Link href="/products/banh-quy" className="ftr-link">
              Bánh quy
            </Link>
            <Link href="/products/hop-snack" className="ftr-link">
              Hộp snack
            </Link>
          </div>

          <div>
            <div className="ftr-heading">Hỗ trợ</div>
            <Link href="/faq" className="ftr-link">
              Câu hỏi thường gặp
            </Link>
            <Link href="/contact" className="ftr-link">
              Liên hệ chúng tôi
            </Link>
          </div>

          <div>
            <div className="ftr-heading">Thông tin</div>
            <Link href="/information/aboutUs" className="ftr-link">
              Về chúng tôi
            </Link>
            <Link href="/information/shippingPolicy" className="ftr-link">
              Chính sách vận chuyển
            </Link>
            <Link href="/information/privacyPolicy" className="ftr-link">
              Chính sách bảo mật
            </Link>
            <Link href="/information/returnsPolicy" className="ftr-link">
              Chính sách đổi trả
            </Link>
            <Link href="/information/termsOfUse" className="ftr-link">
              Điều khoản sử dụng
            </Link>
          </div>

          <div>
            <div className="ftr-heading">Theo dõi</div>
            <div className="ftr-social">
              <img src="/image/facebook.png" alt="" />
              <span>Facebook</span>
            </div>
            <div className="ftr-social">
              <img src="/image/instagram.png" alt="" />
              <span>Instagram</span>
            </div>
            <div className="ftr-social">
              <img src="/image/youtube.png" alt="" />
              <span>YouTube</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "12.5px",
              color: "rgba(255,255,255,0.28)",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            © 2026 Choco Kingdom. Bản quyền đã được bảo lưu.
          </span>
        </div>
      </div>
    </footer>
  );
}
