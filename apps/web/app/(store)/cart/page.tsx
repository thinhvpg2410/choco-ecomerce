"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCart,
  getProductById,
  removeFromCart,
  updateCartItem,
} from "@/services/cart.service";
import { CartItem } from "@/types/type";
import { ShoppingBag, Loader2, Trash2, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchCart } from "@/store/cartSlice";
import { useDispatch } from "react-redux";

function getEffectivePrice(
  item: CartItem,
  productsMap: Record<string, any>,
): number {
  const p = productsMap[item.product_id];
  if (!p) return item.price;

  const disc =
    p.discounted_price ?? p.sale_price ?? p.discount_price ?? p.promo_price;
  if (typeof disc === "number" && disc > 0 && disc < (p.price ?? Infinity))
    return disc;
  return p.price ?? item.price;
}

function getOriginalPrice(
  item: CartItem,
  productsMap: Record<string, any>,
): number | null {
  const p = productsMap[item.product_id];
  if (!p) return null;
  const disc =
    p.discounted_price ?? p.sale_price ?? p.discount_price ?? p.promo_price;
  if (typeof disc === "number" && disc > 0 && disc < (p.price ?? Infinity))
    return p.price;
  return null;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";


function DeleteConfirmModal({
  productName,
  onConfirm,
  onCancel,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,10,5,0.45)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "32px 28px 24px",
          maxWidth: 360,
          width: "calc(100% - 32px)",
          boxShadow:
            "0 24px 60px rgba(15,10,5,0.22), 0 4px 16px rgba(15,10,5,0.08)",
          animation: "slideUp 0.18s ease",
          textAlign: "center",
          fontFamily: "'Nunito', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Trash2 style={{ width: 22, height: 22, color: "#ef4444" }} />
        </div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#1a0f0a",
            margin: "0 0 8px",
          }}
        >
          Xóa sản phẩm?
        </h3>
        <p
          style={{
            fontSize: "13.5px",
            color: "#7a6a60",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Bạn có chắc muốn xóa{" "}
          <strong style={{ color: "#3b1d14" }}>"{productName}"</strong> khỏi giỏ
          hàng không?
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "#f5f0eb",
              border: "none",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#7a6a60",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              transition: "background 0.14s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#ede6de")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#f5f0eb")}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "#be123c",
              border: "none",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              boxShadow: "0 2px 8px rgba(190,18,60,0.28)",
              transition: "background 0.14s, transform 0.12s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#9f1239";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#be123c";
              e.currentTarget.style.transform = "none";
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {},
  );
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cart = await getCart();
        const cartItems = cart?.items ?? [];
        setItems(cartItems);
        const productIds = cartItems.map((item) => item.product_id);
        const products: Record<string, any> = {};
        await Promise.all(
          productIds.map(async (id) => {
            const product = await getProductById(id);
            products[id] = product;
          }),
        );
        setProductsMap(products);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedItems = useMemo(
    () => items.filter((item) => selected.includes(String(item.product_id))),
    [items, selected],
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) =>
          sum + getEffectivePrice(item, productsMap) * item.quantity,
        0,
      ),
    [selectedItems, productsMap],
  );

  const originalTotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const orig = getOriginalPrice(item, productsMap);
        return (
          sum + (orig ?? getEffectivePrice(item, productsMap)) * item.quantity
        );
      }, 0),
    [selectedItems, productsMap],
  );

  const totalSaved = originalTotal - subtotal;

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId);
      dispatch(fetchCart() as any);
      setItems((prev) =>
        prev.filter((item) => String(item.product_id) !== String(productId)),
      );
      setSelected((prev) => prev.filter((id) => id !== String(productId)));
    } catch (error) {
      console.error("Xóa sản phẩm thất bại:", error);
      toast.error("Xóa sản phẩm thất bại");
    }
  };

  const confirmDelete = (productId: string) => {
    const name =
      productsMap[productId]?.name ??
      items.find((i) => String(i.product_id) === productId)?.product?.name ??
      "sản phẩm";
    setDeleteTarget({ id: String(productId), name });
  };

  const handleBuyNow = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm trước khi thanh toán");
      return;
    }
    const checkoutData = selectedItems.map((item) => ({
      id: item.product_id,
      product_id: item.product_id,
      name: item.product?.name ?? productsMap[item.product_id]?.name,
      image:
        item.product?.image_url ??
        productsMap[item.product_id]?.image_url ??
        "",
      price: getEffectivePrice(item, productsMap), // ← effective price
      original_price: getOriginalPrice(item, productsMap),
      quantity: item.quantity,
    }));
    localStorage.setItem(
      "checkout_cart",
      JSON.stringify({
        items: checkoutData,
        subtotal,
        cart_item_ids: selectedItems.map((item) => item.product_id),
      }),
    );
    router.push("/checkout");
  };

  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selected.includes(String(item.product_id)));

  const toggleSelectAll = () => {
    setSelected(isAllSelected ? [] : items.map((i) => String(i.product_id)));
  };

  const getStock = (productId: string, item: CartItem) =>
    item.product?.stock ?? productsMap[productId]?.stock ?? 100;

  const updateQty = async (
    productId: string,
    deltaOrQty: number,
    absolute = false,
  ) => {
    const item = items.find((i) => String(i.product_id) === productId);
    if (!item) return;
    const stock = getStock(productId, item);
    const targetQty = absolute ? deltaOrQty : item.quantity + deltaOrQty;
    const newQty = Math.max(1, Math.min(stock, targetQty));
    setItems((prev) =>
      prev.map((i) =>
        String(i.product_id) === productId ? { ...i, quantity: newQty } : i,
      ),
    );
    setQuantityInputs((prev) => ({ ...prev, [productId]: String(newQty) }));
    try {
      await updateCartItem({ product_id: productId, quantity: newQty });
      dispatch(fetchCart() as any);
    } catch {
      setItems((prev) =>
        prev.map((i) => (String(i.product_id) === productId ? item : i)),
      );
      setQuantityInputs((prev) => ({
        ...prev,
        [productId]: String(item.quantity),
      }));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <style>{cartStyles}</style>
        <div className="cart-loading">
          <Loader2 className="cart-spinner" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!items.length) {
    return (
      <ProtectedRoute>
        <style>{cartStyles}</style>
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <ShoppingBag style={{ width: 40, height: 40, color: "#be123c" }} />
          </div>
          <h2 className="cart-empty-title">Giỏ hàng đang trống</h2>
          <p className="cart-empty-sub">
            Thêm những món ngon vào giỏ rồi quay lại đây thanh toán nhé!
          </p>
          <Link href="/" className="cart-empty-btn">
            Khám phá sản phẩm
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <style>{cartStyles}</style>

      {deleteTarget && (
        <DeleteConfirmModal
          productName={deleteTarget.name}
          onConfirm={() => {
            handleRemove(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="cart-root">
        <div className="cart-container">
          {/* Page title */}
          <div className="cart-page-head">
            <h1 className="cart-page-title">Giỏ hàng</h1>
            <span className="cart-count">{items.length} sản phẩm</span>
          </div>

          <div className="cart-layout">
            {/* ── LEFT: item list ── */}
            <div className="cart-list-col">
              {/* Select all bar */}
              <div className="cart-select-bar">
                <label className="cart-check-label">
                  <input
                    type="checkbox"
                    className="cart-check"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                  <span>Chọn tất cả ({items.length})</span>
                </label>
                {selected.length > 0 && (
                  <span className="cart-selected-hint">
                    {selected.length} đã chọn
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="cart-items">
                {items.map((item) => {
                  const pid = String(item.product_id);
                  const effectivePrice = getEffectivePrice(item, productsMap);
                  const originalPrice = getOriginalPrice(item, productsMap);
                  const isOnSale = originalPrice !== null;
                  const productName =
                    productsMap[pid]?.name ?? item.product?.name ?? "Sản phẩm";
                  const imageUrl =
                    productsMap[pid]?.image_url ??
                    item.product?.image_url ??
                    "";
                  const isChecked = selected.includes(pid);
                  const stock = getStock(pid, item);

                  return (
                    <div
                      key={item.id}
                      className={`cart-item${isChecked ? " cart-item--checked" : ""}`}
                    >
                      {/* Checkbox */}
                      <label className="cart-item-check-wrap">
                        <input
                          type="checkbox"
                          className="cart-check"
                          checked={isChecked}
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(pid)
                                ? prev.filter((id) => id !== pid)
                                : [...prev, pid],
                            )
                          }
                        />
                      </label>

                      {/* Image */}
                      <div className="cart-item-img-wrap">
                        {isOnSale && (
                          <span className="cart-sale-badge">Sale</span>
                        )}
                        <img
                          src={imageUrl || "https://via.placeholder.com/80"}
                          alt={productName}
                          className="cart-item-img"
                        />
                      </div>

                      {/* Info */}
                      <div className="cart-item-info">
                        <Link
                          href={`/product/${pid}`}
                          className="cart-item-name"
                        >
                          {productName}
                        </Link>
                        {/* Price */}
                        <div className="cart-item-price-row">
                          <span className="cart-item-price-eff">
                            {fmt(effectivePrice)}
                          </span>
                          {isOnSale && (
                            <span className="cart-item-price-orig">
                              {fmt(originalPrice!)}
                            </span>
                          )}
                          {isOnSale && (
                            <span className="cart-item-discount-tag">
                              -
                              {Math.round(
                                (1 - effectivePrice / originalPrice!) * 100,
                              )}
                              %
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Qty */}
                      <div className="cart-qty-wrap">
                        <div className="cart-qty">
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateQty(pid, -1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            className="cart-qty-input"
                            min={1}
                            max={stock}
                            value={quantityInputs[pid] ?? String(item.quantity)}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (/^\d*$/.test(raw))
                                setQuantityInputs((prev) => ({
                                  ...prev,
                                  [pid]: raw,
                                }));
                            }}
                            onBlur={() => {
                              const raw =
                                quantityInputs[pid] ?? String(item.quantity);
                              const parsed = Number(raw);
                              const qty = Number.isNaN(parsed)
                                ? item.quantity
                                : Math.max(1, Math.min(stock, parsed));
                              updateQty(pid, qty, true);
                            }}
                          />
                          <button
                            className="cart-qty-btn"
                            onClick={() => updateQty(pid, 1)}
                            disabled={item.quantity >= stock}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="cart-item-total">
                        <span>{fmt(effectivePrice * item.quantity)}</span>
                        {isOnSale && (
                          <span className="cart-item-total-saved">
                            -
                            {fmt(
                              (originalPrice! - effectivePrice) * item.quantity,
                            )}
                          </span>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        className="cart-item-del"
                        title="Xóa"
                        onClick={() => confirmDelete(pid)}
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT: summary ── */}
            <div className="cart-summary">
              <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Tạm tính ({selected.length} sản phẩm)</span>
                  <span>{fmt(originalTotal)}</span>
                </div>
                {totalSaved > 0 && (
                  <div className="cart-summary-row cart-summary-saved">
                    <span>Tiết kiệm</span>
                    <span>-{fmt(totalSaved)}</span>
                  </div>
                )}
                <div className="cart-summary-row cart-summary-ship">
                  <span>Phí giao hàng</span>
                  <span className="cart-free-ship">Miễn phí</span>
                </div>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>Tổng cộng</span>
                <span className="cart-total-amount">{fmt(subtotal)}</span>
              </div>

              {totalSaved > 0 && (
                <div className="cart-saving-banner">
                  🎉 Bạn đang tiết kiệm <strong>{fmt(totalSaved)}</strong>
                </div>
              )}

              <button
                className="cart-checkout-btn"
                onClick={handleBuyNow}
                disabled={selected.length === 0}
              >
                Thanh toán ngay
              </button>

              <Link href="/" className="cart-continue-link">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const cartStyles = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600&display=swap');
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

:root {
  --brand: #be123c;
  --brand-dark: #9f1239;
  --brand-soft: #fff0f3;
  --brand-border: #fecdd3;
  --warm-bg: #fdf8f4;
  --warm-card: #fffcfa;
  --warm-border: #f0e8df;
  --warm-border-2: #e8ddd3;
  --ink: #1a0f0a;
  --ink-2: #3b1d14;
  --ink-3: #7a6a60;
  --ink-4: #b0a098;
  --gold: #c8933a;
  --gold-soft: #fef9ee;
  --font: 'Nunito', system-ui, sans-serif;
  --font-display: 'Playfair Display', Georgia, serif;
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 20px;
  --shadow-sm: 0 1px 3px rgba(58,29,20,0.06), 0 1px 2px rgba(58,29,20,0.04);
  --shadow-md: 0 4px 18px rgba(58,29,20,0.09), 0 1px 4px rgba(58,29,20,0.04);
  --shadow-lg: 0 12px 40px rgba(58,29,20,0.12), 0 2px 8px rgba(58,29,20,0.06);
}

.cart-root { font-family:var(--font); min-height:100vh; background:var(--warm-bg); padding:36px 0 80px; }
.cart-container { max-width:1100px; margin:0 auto; padding:0 20px; }

.cart-loading { min-height:60vh; display:flex; align-items:center; justify-content:center; }
.cart-spinner { width:36px; height:36px; animation:spin 0.8s linear infinite; color:var(--brand); }
@keyframes spin { to{transform:rotate(360deg)} }

/* Empty state */
.cart-empty { min-height:70vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; padding:0 24px; font-family:var(--font); }
.cart-empty-icon { width:88px; height:88px; border-radius:50%; background:var(--brand-soft); border:2px dashed var(--brand-border); display:flex; align-items:center; justify-content:center; }
.cart-empty-title { font-family:var(--font-display); font-size:22px; font-weight:500; color:var(--ink); margin:4px 0 0; }
.cart-empty-sub { font-size:13.5px; color:var(--ink-3); max-width:300px; line-height:1.6; margin:0; }
.cart-empty-btn { margin-top:8px; padding:11px 28px; background:var(--brand); color:#fff; border-radius:100px; font-size:14px; font-weight:700; text-decoration:none; font-family:var(--font); box-shadow:0 2px 10px rgba(190,18,60,0.25); transition:background 0.15s,transform 0.12s; }
.cart-empty-btn:hover { background:var(--brand-dark); transform:translateY(-1px); }

/* Page head */
.cart-page-head { display:flex; align-items:baseline; gap:14px; margin-bottom:24px; }
.cart-page-title { font-family:var(--font-display); font-size:26px; font-weight:500; color:var(--ink); margin:0; letter-spacing:-0.01em; }
.cart-count { font-size:13px; color:var(--ink-4); font-weight:500; }

/* Layout */
.cart-layout { display:grid; grid-template-columns:1fr 320px; gap:22px; align-items:start; }
@media(max-width:860px) { .cart-layout { grid-template-columns:1fr; } }

/* Select all bar */
.cart-select-bar { display:flex; align-items:center; justify-content:space-between; padding:13px 18px; background:var(--warm-card); border:1px solid var(--warm-border); border-radius:var(--r-md); margin-bottom:10px; }
.cart-check-label { display:flex; align-items:center; gap:9px; cursor:pointer; font-size:13.5px; font-weight:600; color:var(--ink-2); }
.cart-check { width:16px; height:16px; accent-color:var(--brand); cursor:pointer; border-radius:4px; flex-shrink:0; }
.cart-selected-hint { font-size:12.5px; color:var(--brand); font-weight:600; }

/* Item list */
.cart-items { display:flex; flex-direction:column; gap:10px; }

/* Cart item */
.cart-item {
  display:grid;
  grid-template-columns: 28px 76px 1fr 110px 90px 28px;
  align-items:center;
  gap:14px;
  padding:14px 16px;
  background:var(--warm-card);
  border:1.5px solid var(--warm-border);
  border-radius:var(--r-md);
  box-shadow:var(--shadow-sm);
  transition:border-color 0.15s, box-shadow 0.15s;
  position:relative;
}
.cart-item:hover { border-color:var(--warm-border-2); box-shadow:var(--shadow-md); }
.cart-item--checked { border-color:var(--brand-border); background:#fffafb; }
@media(max-width:600px) {
  .cart-item { grid-template-columns:28px 60px 1fr 28px; grid-template-rows:auto auto; gap:10px 12px; }
}

.cart-item-check-wrap { display:flex; align-items:center; justify-content:center; }

/* Item image */
.cart-item-img-wrap { position:relative; width:76px; height:76px; border-radius:12px; overflow:hidden; flex-shrink:0; background:#f5ede4; }
.cart-item-img { width:100%; height:100%; object-fit:cover; }
.cart-sale-badge {
  position:absolute; top:5px; left:5px; z-index:1;
  background:var(--brand); color:#fff;
  font-size:10px; font-weight:800; padding:2px 6px;
  border-radius:5px; letter-spacing:0.04em;
  font-family:var(--font);
}

/* Item info */
.cart-item-info { min-width:0; display:flex; flex-direction:column; gap:6px; }
.cart-item-name {
  font-size:13.5px; font-weight:700; color:var(--ink);
  text-decoration:none; line-height:1.35;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
  transition:color 0.13s;
}
.cart-item-name:hover { color:var(--brand); }
.cart-item-price-row { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
.cart-item-price-eff { font-size:14px; font-weight:800; color:var(--brand); }
.cart-item-price-orig { font-size:12px; color:var(--ink-4); text-decoration:line-through; font-weight:500; }
.cart-item-discount-tag {
  font-size:10.5px; font-weight:800; color:var(--gold);
  background:var(--gold-soft); border:1px solid #f0d9a8;
  padding:1.5px 6px; border-radius:5px;
}

/* Qty */
.cart-qty-wrap { display:flex; justify-content:center; }
.cart-qty {
  display:flex; align-items:center;
  border:1.5px solid var(--warm-border-2);
  border-radius:10px; overflow:hidden;
  background:#faf7f4;
}
.cart-qty-btn {
  width:32px; height:34px;
  display:flex; align-items:center; justify-content:center;
  background:transparent; border:none;
  font-size:16px; font-weight:700; color:var(--ink-3);
  cursor:pointer; transition:background 0.13s, color 0.13s;
  font-family:var(--font);
}
.cart-qty-btn:hover:not(:disabled) { background:var(--brand-soft); color:var(--brand); }
.cart-qty-btn:disabled { color:var(--warm-border-2); cursor:not-allowed; }
.cart-qty-input {
  width:44px; height:34px;
  text-align:center; border:none; outline:none;
  background:transparent;
  font-size:14px; font-weight:800; color:var(--ink);
  font-family:var(--font);
  -moz-appearance:textfield;
}
.cart-qty-input::-webkit-inner-spin-button,
.cart-qty-input::-webkit-outer-spin-button { -webkit-appearance:none; }

/* Line total */
.cart-item-total { display:flex; flex-direction:column; align-items:flex-end; gap:3px; }
.cart-item-total span { font-size:14px; font-weight:800; color:var(--ink-2); }
.cart-item-total-saved { font-size:11px; color:var(--brand); font-weight:600; }

/* Delete btn */
.cart-item-del {
  width:28px; height:28px;
  display:flex; align-items:center; justify-content:center;
  border:none; background:transparent; border-radius:8px;
  color:var(--ink-4); cursor:pointer;
  transition:background 0.13s, color 0.13s;
}
.cart-item-del:hover { background:#fef2f2; color:#ef4444; }

/* ── Summary ── */
.cart-summary {
  background:var(--warm-card);
  border:1.5px solid var(--warm-border);
  border-radius:var(--r-lg);
  padding:24px 22px;
  box-shadow:var(--shadow-md);
  position:sticky; top:24px;
  font-family:var(--font);
}
.cart-summary-title {
  font-family:var(--font-display); font-size:18px; font-weight:500;
  color:var(--ink); margin:0 0 18px; letter-spacing:-0.01em;
}
.cart-summary-rows { display:flex; flex-direction:column; gap:10px; }
.cart-summary-row { display:flex; justify-content:space-between; font-size:13.5px; color:var(--ink-3); font-weight:500; }
.cart-summary-saved { color:#15803d; }
.cart-summary-saved span:last-child { font-weight:700; }
.cart-free-ship { color:#15803d; font-weight:700; }
.cart-summary-divider { height:1px; background:var(--warm-border); margin:16px 0; }
.cart-summary-total { display:flex; justify-content:space-between; align-items:baseline; }
.cart-summary-total > span:first-child { font-size:15px; font-weight:700; color:var(--ink); }
.cart-total-amount { font-family:var(--font-display); font-size:22px; font-weight:600; color:var(--brand); }

.cart-saving-banner {
  margin:14px 0 0;
  padding:10px 14px;
  background:linear-gradient(135deg,#fff8ec,#fff3f6);
  border:1px solid #f5dfc0;
  border-radius:10px;
  font-size:12.5px;
  color:var(--ink-2);
  font-weight:600;
  line-height:1.5;
}

.cart-checkout-btn {
  display:block; width:100%;
  margin-top:18px;
  padding:13px 0;
  background:var(--brand);
  color:#fff; border:none;
  border-radius:12px;
  font-size:15px; font-weight:800;
  font-family:var(--font);
  cursor:pointer; letter-spacing:0.02em;
  box-shadow:0 3px 14px rgba(190,18,60,0.3);
  transition:background 0.15s, transform 0.12s, box-shadow 0.15s;
}
.cart-checkout-btn:hover:not(:disabled) {
  background:var(--brand-dark); transform:translateY(-1px);
  box-shadow:0 5px 20px rgba(190,18,60,0.35);
}
.cart-checkout-btn:disabled {
  background:#ddd; color:#aaa; cursor:not-allowed;
  box-shadow:none; transform:none;
}

.cart-continue-link {
  display:block; text-align:center;
  margin-top:12px;
  font-size:13px; color:var(--ink-3); font-weight:600;
  text-decoration:none; transition:color 0.13s;
}
.cart-continue-link:hover { color:var(--brand); }
`;
