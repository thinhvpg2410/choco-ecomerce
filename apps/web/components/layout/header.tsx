"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  ShoppingCart,
  ChevronDown,
  User,
  Package,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getProductById } from "@/services/cart.service";
import { clearCartState } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { authLogout } from "@/services/auth.service";
import { getCategories, type Category } from "@/services/category.service";
import { getBrands, type Brand } from "@/services/brand.service";
import { fetchCart } from "@/store/cartSlice";

export function Header() {
  const [openCart, setOpenCart] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [cartAuthWarning, setCartAuthWarning] = useState(false);

  const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const brandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const policyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const avatarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const makeHover = (
    setter: (v: boolean) => void,
    ref: React.MutableRefObject<NodeJS.Timeout | null>,
  ) => ({
    onMouseEnter: () => {
      if (ref.current) clearTimeout(ref.current);
      setter(true);
    },
    onMouseLeave: () => {
      ref.current = setTimeout(() => setter(false), 150);
    },
  });

  const cartHover = makeHover(setOpenCart, cartTimeoutRef);
  const catHover = makeHover(setOpenCategory, categoryTimeoutRef);
  const brandHover = makeHover(setOpenBrand, brandTimeoutRef);
  const policyHover = makeHover(setOpenPolicy, policyTimeoutRef);
  const avatarHover = makeHover(setOpenAvatar, avatarTimeoutRef);

  useEffect(() => {
    getCategories().then(setCategories);
    getBrands().then(setBrands);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productIds = [
          ...new Set(cartItems.map((i: any) => i.product_id)),
        ];
        const map: Record<string, any> = {};
        await Promise.all(
          productIds.map(async (id: string) => {
            const p = await getProductById(id);
            if (p) map[id] = p;
          }),
        );
        setProductsMap(map);
      } catch (err) {
        console.error(err);
      }
    };
    if (cartItems.length > 0) loadProducts();
    else setProductsMap({});
  }, [cartItems]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart() as any);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await authLogout();
    dispatch(clearCartState());
    dispatch(logout());
    window.location.href = "/";
  };

  const handleCartIconClick = () => {
    if (!isAuthenticated) {
      setCartAuthWarning(true);
      setTimeout(() => setCartAuthWarning(false), 3000);
      return;
    }
    router.push("/cart");
  };

  const ArrowIndicator = ({ open }: { open: boolean }) => (
    <span
      style={{
        position: "absolute",
        bottom: -3,
        left: "50%",
        transform: "translateX(-50%)",
        width: 0,
        height: 0,
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
        borderBottom: open ? "6px solid #fff" : "6px solid transparent",
        filter: open ? "drop-shadow(0 -1px 1px rgba(0,0,0,0.10))" : "none",
        transition: "all 0.2s",
        pointerEvents: "none",
      }}
    />
  );



  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        /* ── TOKENS ── */
        :root {
          --choc:        #5C3317;
          --choc-mid:    #7B4A28;
          --choc-light:  #A0673A;
          --choc-pale:   #F5EDE5;
          --choc-border: #E8D5C4;
          --choc-text:   #3B2010;
          --cream:       #FFFAF6;
          --gray:        #6b7280;
        }

        .hdr-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          border-bottom: 1.5px solid var(--choc-border);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 18px rgba(92,51,23,0.08);
        }
        .hdr-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 64px;
          padding: 0 28px;
          gap: 16px;
        }

        /* NAV ITEM */
        .nav-item {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 13px;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.045em;
          text-transform: uppercase;
          color: var(--choc-text);
          border-radius: 8px;
          cursor: pointer;
          transition: color 0.18s, background 0.18s;
          white-space: nowrap;
          text-decoration: none !important;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-item:hover, .nav-item.active {
          color: var(--choc);
          background: var(--choc-pale);
          text-decoration: none !important;
        }
        .nav-chevron {
          width: 13px; height: 13px;
          transition: transform 0.2s;
          flex-shrink: 0;
          opacity: 0.65;
        }
        .nav-item.active .nav-chevron { transform: rotate(180deg); opacity: 1; }

        /* MEGA DROPDOWN */
        .mega-dropdown {
          position: fixed;
          left: 0; right: 0;
          top: 64px;
          background: var(--cream);
          border-top: 2px solid var(--choc-border);
          border-bottom: 1.5px solid var(--choc-border);
          box-shadow: 0 10px 40px rgba(92,51,23,0.12);
          padding: 22px 40px 24px;
          z-index: 999;
          animation: dropIn 0.17s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mega-inner {
          max-width: 1400px;
          margin: 0 auto;
        }
        .mega-section-title {
          display: block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--choc-light);
          margin-bottom: 10px;
        }
        .mega-grid {
          display: grid;
          gap: 2px 28px;
        }
        .mega-link {
          display: block;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--choc-text);
          text-decoration: none;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .mega-link:hover {
          color: var(--choc);
          background: var(--choc-pale);
        }

        /* POLICY MEGA — 4 cards */
.policy-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;
  max-width: 420px;
  margin: 0;
}

/* giống mega-link */
.policy-link {
  display: block;
  padding: 7px 10px;
  border-radius: 7px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--choc-text);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;
  text-align: left;
}

.policy-link:hover {
  color: var(--choc);
  background: var(--choc-pale);
}

        /* CART DROPDOWN */
        .cart-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: 320px;
          background: #fff;
          border: 1.5px solid var(--choc-border);
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(92,51,23,0.13);
          padding: 16px;
          z-index: 9999;
          animation: dropIn 0.17s ease;
        }
        .cart-title {
          font-family: 'Lora', serif;
          font-size: 15px;
          color: var(--choc-text);
          font-weight: 700;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--choc-border);
        }
        .cart-item {
          display: flex;
          gap: 10px;
          padding: 7px 8px;
          border-radius: 9px;
          transition: background 0.15s;
        }
        .cart-item:hover { background: var(--choc-pale); }
        .cart-item img {
          width: 46px; height: 46px;
          object-fit: cover;
          border-radius: 7px;
          border: 1px solid var(--choc-border);
          flex-shrink: 0;
        }
        .cart-item-name  { font-size: 13px; font-weight: 600; color: var(--choc-text); line-height: 1.3; }
        .cart-item-qty   { font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
        .cart-item-price { font-size: 13px; font-weight: 700; color: var(--choc); margin-top: 2px; }
        .cart-auth-warn {
          background: #fff8f0;
          border: 1px solid var(--choc-border);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--choc-text);
          font-weight: 600;
          animation: dropIn 0.17s ease;
        }
        .cart-auth-warn svg { flex-shrink: 0; color: var(--choc-light); margin-top: 1px; }
        .cart-btn {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: linear-gradient(135deg, var(--choc-mid), var(--choc));
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
        }
        .cart-btn:hover { opacity: 0.91; transform: translateY(-1px); }
        .cart-badge {
          position: absolute;
          top: -8px; right: -8px;
          min-width: 17px; height: 17px;
          background: linear-gradient(135deg, var(--choc-mid), var(--choc));
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 2px solid var(--cream);
          pointer-events: none;
        }

        /* AVATAR DROPDOWN */
        .avatar-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          background: #fff;
          border: 1.5px solid var(--choc-border);
          border-radius: 13px;
          box-shadow: 0 12px 40px rgba(92,51,23,0.13);
          padding: 8px;
          min-width: 200px;
          z-index: 9999;
          animation: dropIn 0.17s ease;
        }
        .avatar-header {
          padding: 10px 12px 9px;
          border-bottom: 1px solid var(--choc-border);
          margin-bottom: 6px;
        }
        .avatar-name { font-weight: 800; font-size: 14px; color: var(--choc-text); }
        .avatar-role { font-size: 11px; color: var(--choc-light); margin-top: 2px; font-weight: 500; }
        .avatar-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--choc-text);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
        }
        .avatar-menu-item:hover { background: var(--choc-pale); color: var(--choc); }
        .avatar-menu-item.danger { color: #dc2626; }
        .avatar-menu-item.danger:hover { background: #fef2f2; color: #b91c1c; }
        .avatar-menu-item svg { width: 15px; height: 15px; flex-shrink: 0; }
        .avatar-divider { height: 1px; background: var(--choc-border); margin: 6px 0; }

        /* AVATAR RING */
        .avatar-ring {
          cursor: pointer;
          border-radius: 999px;
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .avatar-ring:hover, .avatar-ring.open {
          box-shadow: 0 0 0 3px var(--choc-light);
          transform: scale(1.05);
        }

        /* AUTH BUTTONS */
        .btn-login {
          padding: 7px 16px;
          border: 1.5px solid var(--choc-border);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--choc);
          background: transparent;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          display: inline-block;
        }
        .btn-login:hover { background: var(--choc-pale); border-color: var(--choc-light); }
        .btn-register {
          padding: 7px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, var(--choc-mid), var(--choc));
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          display: inline-block;
        }
        .btn-register:hover { opacity: 0.88; transform: translateY(-1px); }

        .logo-img { height: 44px; transition: opacity 0.15s; }
        .logo-img:hover { opacity: 0.82; }
      `}</style>

      <header className="hdr-root">
        <div className="hdr-inner">
          {/* ── LEFT ── */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  lineHeight: 1,
                  position: "relative",
                  userSelect: "none",
                  padding: "4px 2px",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {/* CHOCO */}
                <span
                  style={{
                    fontFamily: "'Lora', serif",
                    fontWeight: 700,
                    fontSize: "24px",
                    letterSpacing: "0.12em",
                    background:
                      "linear-gradient(135deg, #3B1F0A 0%, #7B4A28 60%, #A0673A 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    display: "block",
                    marginLeft: "0px",
                  }}
                >
                  CHOCO
                </span>

                {/* KINGDOM */}
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: "10.5px",
                    letterSpacing: "0.35em",
                    color: "#C48A3F",
                    display: "block",
                    textTransform: "uppercase",
                    marginLeft: "22px",
                    marginTop: "-1px",
                    opacity: 0.9,
                  }}
                >
                  KINGDOM
                </span>
              </div>
            </Link>
          </div>

          {/* ── CENTER ── */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <Link href="/aboutus" className="nav-item">
              Giới thiệu
            </Link>
            <Link href="/product" className="nav-item">
              Sản phẩm
            </Link>

            {/* LOẠI */}
            <div style={{ position: "relative" }} {...catHover}>
              <button className={`nav-item ${openCategory ? "active" : ""}`}>
                Loại <ChevronDown className="nav-chevron" />
                <ArrowIndicator open={openCategory} />
              </button>
              {openCategory && (
                <div className="mega-dropdown" {...catHover}>
                  <div className="mega-inner">
                    <span className="mega-section-title">
                      Danh mục sản phẩm
                    </span>
                    {categories.length > 0 ? (
                      <div
                        className="mega-grid"
                        style={{
                          gridTemplateRows: `repeat(${Math.min(6, Math.ceil(categories.length / 4))}, auto)`,
                          gridTemplateColumns: `repeat(${Math.min(4, Math.ceil(categories.length / 6))}, 1fr)`,
                        }}
                      >
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/product?category=${cat.slug ?? cat.id}`}
                            className="mega-link"
                            onClick={() => setOpenCategory(false)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#9ca3af", fontSize: 13 }}>
                        Đang tải...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* THƯƠNG HIỆU */}
            <div style={{ position: "relative" }} {...brandHover}>
              <button className={`nav-item ${openBrand ? "active" : ""}`}>
                Thương hiệu <ChevronDown className="nav-chevron" />
                <ArrowIndicator open={openBrand} />
              </button>
              {openBrand && (
                <div className="mega-dropdown" {...brandHover}>
                  <div className="mega-inner">
                    <span className="mega-section-title">
                      Thương hiệu nổi bật
                    </span>
                    {brands.length > 0 ? (
                      <div
                        className="mega-grid"
                        style={{
                          gridTemplateRows: `repeat(${Math.min(6, Math.ceil(brands.length / 4))}, auto)`,
                          gridTemplateColumns: `repeat(${Math.min(4, Math.ceil(brands.length / 6))}, 1fr)`,
                        }}
                      >
                        {brands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/product?brand=${brand.slug ?? brand.id}`}
                            className="mega-link"
                            onClick={() => setOpenBrand(false)}
                          >
                            {brand.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#9ca3af", fontSize: 13 }}>
                        Đang tải...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CHÍNH SÁCH*/}
            <Link href="/policy" className="nav-item">
              Chính sách
            </Link>
          </nav>

          {/* ── RIGHT ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "16px",
            }}
          >
            {/* CART */}
            <div
              style={{ position: "relative" }}
              {...(isAuthenticated ? cartHover : {})}
            >
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={!isAuthenticated ? handleCartIconClick : undefined}
              >
                <ShoppingCart
                  style={{
                    width: 21,
                    height: 21,
                    color: "var(--gray)",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--choc)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--gray)")
                  }
                />
                {cartItems.length > 0 && (
                  <span className="cart-badge">{cartItems.length}</span>
                )}
              </div>

              {/* not-logged-in warning */}
              {!isAuthenticated && cartAuthWarning && (
                <div className="cart-dropdown">
                  <div className="cart-auth-warn">
                    <AlertCircle size={15} />
                    <div>
                      Vui lòng{" "}
                      <Link
                        href="/auth/login"
                        style={{
                          color: "var(--choc)",
                          textDecoration: "underline",
                        }}
                      >
                        đăng nhập
                      </Link>{" "}
                      để xem giỏ hàng.
                    </div>
                  </div>
                </div>
              )}

              {/* logged-in cart */}
              {isAuthenticated && openCart && (
                <div className="cart-dropdown" {...cartHover}>
                  <div className="cart-title">🛒 Giỏ hàng của bạn</div>
                  {cartItems.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px 0",
                        color: "#9ca3af",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🛒</div>
                      Chưa có sản phẩm nào
                    </div>
                  ) : (
                    <div
                      style={{
                        maxHeight: 240,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {cartItems.map((item: any) => {
                        const product = productsMap[item.product_id] || {};
                        return (
                          <div key={item.product_id} className="cart-item">
                            <img
                              src={product.image_url || "/no-image.png"}
                              alt={product.name}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="cart-item-name">
                                {product.name || "Sản phẩm"}
                              </div>
                              <div className="cart-item-qty">
                                x{item.quantity}
                              </div>
                              <div className="cart-item-price">
                                {(item.price * item.quantity).toLocaleString()}đ
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {cartItems.length > 0 && (
                    <div
                      style={{
                        borderTop: "1px solid var(--choc-border)",
                        marginTop: 10,
                        paddingTop: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--gray)",
                          fontWeight: 600,
                        }}
                      >
                        Tổng cộng
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "var(--choc)",
                        }}
                      >
                        {cartItems
                          .reduce(
                            (sum: number, i: any) => sum + i.price * i.quantity,
                            0,
                          )
                          .toLocaleString()}
                        đ
                      </span>
                    </div>
                  )}
                  <button
                    className="cart-btn"
                    onClick={() => {
                      router.push("/cart");
                      setOpenCart(false);
                    }}
                  >
                    Xem giỏ hàng →
                  </button>
                </div>
              )}
            </div>

            {/* AUTH */}
            {isLoading ? (
              <div
                style={{
                  width: 80,
                  height: 32,
                  background: "var(--choc-pale)",
                  borderRadius: 8,
                }}
              />
            ) : !isAuthenticated ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/auth/login" className="btn-login">
                  Đăng nhập
                </Link>
                <Link href="/auth/register" className="btn-register">
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div style={{ position: "relative" }} {...avatarHover}>
                <Avatar
                  className={`avatar-ring ${openAvatar ? "open" : ""}`}
                  style={{ width: 36, height: 36 }}
                >
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback
                    style={{
                      background: "linear-gradient(135deg,#d4a97a,#a0673a)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {openAvatar && (
                  <div className="avatar-dropdown">
                    <div className="avatar-header">
                      <div className="avatar-name">{user?.username}</div>
                      <div className="avatar-role">Thành viên</div>
                    </div>
                    <Link
                      href="/profile"
                      className="avatar-menu-item"
                      onClick={() => setOpenAvatar(false)}
                    >
                      <User /> Tài khoản của tôi
                    </Link>
                    <Link
                      href="/order"
                      className="avatar-menu-item"
                      onClick={() => setOpenAvatar(false)}
                    >
                      <Package /> Đơn hàng
                    </Link>
                    <div className="avatar-divider" />
                    <button
                      className="avatar-menu-item danger"
                      style={{
                        width: "100%",
                        border: "none",
                        background: "none",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                      onClick={handleLogout}
                    >
                      <LogOut /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
