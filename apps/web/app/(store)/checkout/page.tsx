"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  MapPin,
  Tag,
  CreditCard,
  MessageSquare,
  ChevronRight,
  Check,
  Loader2,
  X,
} from "lucide-react";

import { getAddresses, createAddress } from "@/services/user-address.service";
import { applyCoupon } from "@/services/coupon.service";
import type { UserAddress } from "@/types/type";

import api from "@/services/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createOrder } from "@/services/order.service";
import { createPayment } from "@/services/payment.service";
import type { CartItem } from "@/types/type";
import {
  AddressFormModal,
  type AddressFormData,
} from "@/components/address/AddressModal";

// ==================== PAYPAL ====================
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
  null,
  );
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<
    {
      code: string;
      discount: number;
      finalAmount: number;
      description?: string;
    }[]
  >([]);
  const [voucherError, setVoucherError] = useState("");
  const [payMethod, setPayMethod] = useState<"COD" | "PayPal">("COD");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);

  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<{
    product_id: string;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    setIsBuyNow(mode === "buy_now");
  }, []);

  // PayPal Configuration
  const paypalOptions = {
    "client-id":
      "ASFKGN8SnTQC9y2NLY2uY1Y3x28pKrY2V8Z4iqDAWYMaQPXmBFhkYrpXShl4JNbEYGRlUruBdjWi2ryl", // ← Thay bằng Client ID thật của bạn
    currency: "USD", // Khuyến nghị dùng USD
    intent: "capture" as const,
  };

  useEffect(() => {
    const data = localStorage.getItem("checkout_cart");

    console.log("📦 RAW checkout_cart:", data);

    if (!data) {
      setLoadingCart(false);
      return;
    }

    try {
      const parsed = JSON.parse(data);

      console.log("📦 PARSED:", parsed);

      setCartItemIds(parsed.cart_item_ids ?? []);

      if (parsed.buy_now) {
        const productId = parsed.product_id;

        if (!productId) {
          console.error("❌ Missing product_id");
          toast.error("Lỗi sản phẩm không hợp lệ");
          setLoadingCart(false);
          return;
        }

        const buyNow = {
          product_id: productId,
          quantity: Number(parsed.quantity ?? 1),
        };

        setBuyNowProduct(buyNow);

        setItems([
          {
            id: productId,
            name: parsed.name ?? "Sản phẩm",
            image: parsed.image ?? "",
            price: Number(parsed.price ?? 0),
            quantity: Number(parsed.quantity ?? 1),
          },
        ]);
      } else {
        setItems(parsed.items ?? []);
      }
    } catch (err) {
      console.error("checkout_cart parse error:", err);
    } finally {
      setLoadingCart(false);
    }

    getAddresses()
      .then((res) => {
        setAddresses(res);
        if (res.length > 0) setSelectedAddress(res[0]);
      })
      .finally(() => setLoadingCart(false));
  }, []);

 

  const SHIPPING = 30_000;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
 const totalDiscount = appliedVouchers.reduce(
   (sum, item) => sum + item.discount,
   0,
 );

 const total = Math.max(0, subtotal + SHIPPING - totalDiscount);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
console.log("📦 ITEMS STATE:", items);
  const applyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();

    if (!code) {
      setVoucherError("Vui lòng nhập mã");
      return;
    }

    // check duplicate
    const existed = appliedVouchers.find((v) => v.code === code);

    if (existed) {
      setVoucherError("Voucher đã được áp dụng");
      return;
    }

    try {
      const data = await applyCoupon({
        code,
        subtotal: subtotal + SHIPPING - totalDiscount,
      });

      if (!data) {
        throw new Error("Coupon invalid");
      }

      const discount = Number(data.discount_amount || 0);

      const newVoucher = {
        code: data.code,
        discount,
        finalAmount: data.final_amount,
        description: `Giảm ${fmt(discount)}`,
      };

      setAppliedVouchers((prev) => [...prev, newVoucher]);

      setVoucherError("");
      setVoucherInput("");

      toast.success(`Áp dụng mã ${data.code} thành công!`);
    } catch (err: any) {
      console.error("❌ Apply coupon error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Mã giảm giá không hợp lệ";

      setVoucherError(message);

      toast.error(message);
    }
  };

  const placeOrder = async (paymentId?: string, paypalOrderId?: string) => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setPlacing(true);

    try {
      const shippingAddress = `${selectedAddress.address}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`;

      

      const payload: any = {
        receiver_name:
          selectedAddress.receiver_name || selectedAddress.receiverName,
        receiver_phone:
          selectedAddress.receiver_phone || selectedAddress.receiverPhone,
        shipping_address: shippingAddress,
        payment_method: payMethod,
        note: note?.trim() || undefined,
        cart_item_ids: cartItemIds,
        buy_now: isBuyNow,
      };

      if (isBuyNow && buyNowProduct) {
        payload.product_id = buyNowProduct.product_id;
        payload.quantity = Number(buyNowProduct.quantity || 1);
      }

      console.log("📤 Creating order with payload:", payload);

      const order = await createOrder(payload);

      // Tạo payment record
      await createPayment({
        order_id: order.id,
        payment_method: payMethod === "COD" ? "COD" : "PayPal",
        transaction_code: paymentId || paypalOrderId,
      });

      toast.success("Đặt hàng thành công!");
      localStorage.removeItem("checkout_cart");
      router.push(`/order/${order.id}`);
    } catch (err: any) {
      console.error("❌ Create order error:", err.response?.data || err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Đặt hàng thất bại, vui lòng thử lại",
      );
    } finally {
      setPlacing(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="max-w-xl w-full rounded-3xl bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Không có sản phẩm để thanh toán
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Vui lòng chọn sản phẩm trong giỏ hàng để tới trang thanh toán.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => router.push("/cart")}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              Quay lại giỏ hàng
            </Button>
            <Button onClick={() => router.push("/")} variant="outline">
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight pb-1">
          Đặt hàng
        </h1>

        {/* Sản phẩm */}
        <Section
          icon={<ShoppingBag className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-50"
          title="Đơn hàng"
          badge={items.length}
          right={
            <span className="text-sm text-gray-400 font-medium">
              {fmt(subtotal)}
            </span>
          }
        >
          <div className="flex flex-col divide-y divide-gray-50">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    {fmt(item.price)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13.5px] font-bold text-gray-900">
                    {fmt(item.price * item.quantity)}
                  </p>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">
                    × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Địa chỉ giao hàng */}
        <Section
          icon={<MapPin className="w-4 h-4 text-rose-500" />}
          iconBg="bg-rose-50"
          title="Địa chỉ giao hàng"
          right={
            <button
              onClick={() => setAddrOpen(true)}
              className="text-sm font-bold text-rose-500"
            >
              + Thêm mới
            </button>
          }
        >
          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scroll">
            {addresses.length === 0 && (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                <p className="text-sm text-gray-400">
                  Chưa có địa chỉ giao hàng
                </p>
              </div>
            )}

            {addresses.map((addr) => {
              const active = selectedAddress?.id === addr.id;

              return (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`w-full text-left rounded-2xl border p-3 transition-all duration-200 ${
                    active
                      ? "border-rose-400 bg-rose-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio */}
                    <div
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        active ? "border-rose-500" : "border-gray-300"
                      }`}
                    >
                      {active && (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">
                          {addr.receiver_name || addr.receiverName}
                        </p>

                        <span className="text-[11px] text-gray-400">|</span>

                        <p className="text-xs text-gray-500">
                          {addr.receiver_phone || addr.receiverPhone}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">
                        {addr.address}, {addr.ward}, {addr.district},{" "}
                        {addr.city}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Voucher */}
        <Section
          icon={<Tag className="w-4 h-4 text-violet-500" />}
          iconBg="bg-violet-50"
          title="Mã giảm giá"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã voucher..."
              value={voucherInput}
              onChange={(e) => {
                setVoucherInput(e.target.value);
                setVoucherError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && applyVoucher()}
              className="rounded-xl text-sm flex-1"
              disabled={false}
            />
            <Button
              onClick={applyVoucher}
              disabled={false}
              className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-5"
            >
              Áp dụng
            </Button>
          </div>
          {voucherError && (
            <p className="text-xs text-rose-500 mt-1.5">{voucherError}</p>
          )}
          {appliedVouchers.length > 0 && (
            <div className="mt-3 flex flex-col gap-3">
              {appliedVouchers.map((voucher) => (
                <div
                  key={voucher.code}
                  className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 shadow-sm"
                >
                  {/* remove */}
                  <button
                    onClick={() =>
                      setAppliedVouchers((prev) =>
                        prev.filter((v) => v.code !== voucher.code),
                      )
                    }
                    className="absolute top-3 right-3 text-rose-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start gap-3">
                    {/* icon */}
                    <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-rose-500" />
                    </div>

                    {/* content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-rose-600 tracking-wide">
                          {voucher.code}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold">
                          Đã áp dụng
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">
                        {voucher.description}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          Số tiền giảm:
                        </span>

                        <span className="text-lg font-black text-green-600">
                          -{fmt(voucher.discount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Thanh toán */}
        <Section
          icon={<CreditCard className="w-4 h-4 text-blue-500" />}
          iconBg="bg-blue-50"
          title="Phương thức thanh toán"
        >
          <div className="flex flex-col gap-2">
            <PayOption
              selected={payMethod === "COD"}
              onClick={() => setPayMethod("COD")}
              iconBg="bg-orange-50"
              icon={<ShoppingBag className="w-4 h-4 text-orange-500" />}
              name="Thanh toán khi nhận hàng (COD)"
              desc="Trả tiền mặt khi nhận hàng"
            />

            <PayOption
              selected={payMethod === "PayPal"}
              onClick={() => setPayMethod("PayPal")}
              iconBg="bg-blue-50"
              icon={<CreditCard className="w-4 h-4 text-blue-600" />}
              name="Thanh toán qua PayPal"
              desc="Thanh toán an toàn, nhanh chóng bằng PayPal"
            />
          </div>

          {/* PayPal Buttons */}
          {payMethod === "PayPal" && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <PayPalScriptProvider options={paypalOptions}>
                <PayPalButtons
                  style={{ layout: "vertical", shape: "rect", color: "blue" }}
                  createOrder={async () => {
                    try {
                      const usdAmount = Math.max(
                        0.01,
                        Math.round((total / 23000) * 100) / 100,
                      ); // đảm bảo tối thiểu 0.01 USD

                      console.log(
                        `🔄 Gửi amount = ${usdAmount} USD (từ ${total}đ)`,
                      );

                      const response = await api.post("/paypal/create-order", {
                        amount: usdAmount,
                        currency: "USD",
                        description: `Đơn hàng Choco Kingdom #${Date.now()}`,
                      });

                      console.log("✅ PayPal Order created:", response.data);
                      return response.data.id;
                    } catch (err: any) {
                      console.error(
                        "❌ Create Order Failed:",
                        err.response?.data || err,
                      );

                      const errorMsg =
                        err.response?.data?.message || err.message;
                      toast.error(`Lỗi tạo đơn PayPal: ${errorMsg}`);
                      throw err;
                    }
                  }}
                  onApprove={async (data) => {
                    try {
                      const response = await api.post("/paypal/capture-order", {
                        orderId: data.orderID,
                      });

                      console.log("✅ Payment captured:", response.data);

                      toast.success("Thanh toán PayPal thành công!");

                      await placeOrder(response.data.id, data.orderID);
                    } catch (err: any) {
                      console.error("onApprove Error:", err);

                      toast.error(
                        err?.response?.data?.message ||
                          "Xác nhận thanh toán thất bại",
                      );
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal SDK Error:", err);
                    toast.error("Lỗi PayPal. Vui lòng thử lại sau.");
                  }}
                />
              </PayPalScriptProvider>
            </div>
          )}
        </Section>

        {/* Lời nhắn */}
        <Section
          icon={<MessageSquare className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-50"
          title="Lời nhắn"
        >
          <Textarea
            placeholder="Ghi chú cho người bán..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-xl text-sm resize-none h-20 border-gray-200 focus:border-rose-400"
          />
        </Section>

        {/* Tổng tiền - Chỉ hiển thị khi chọn COD */}
        {payMethod === "COD" && (
          <Section
            icon={<CreditCard className="w-4 h-4 text-rose-500" />}
            iconBg="bg-rose-50"
            title="Chi tiết thanh toán"
          >
            <div className="flex flex-col gap-2.5">
              <SumRow
                label={`Tạm tính (${items.length} sản phẩm)`}
                value={fmt(subtotal)}
              />
              <SumRow label="Phí vận chuyển" value={fmt(SHIPPING)} />
              {appliedVouchers.map((voucher) => (
                <SumRow
                  key={voucher.code}
                  label={`Voucher ${voucher.code}`}
                  value={`-${fmt(voucher.discount)}`}
                  green
                />
              ))}
              <div className="h-px bg-gray-100 my-0.5" />
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-extrabold text-gray-900 tracking-tight">
                  Tổng cộng
                </span>
                <span className="text-[22px] font-black text-rose-500 tracking-tight">
                  {fmt(total)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => placeOrder()}
              disabled={placing}
              className="w-full mt-4 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-[15px] font-black tracking-tight flex items-center justify-center gap-2 transition-all active:scale-[.99]"
            >
              {placing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" /> Đặt hàng · {fmt(total)}
                </>
              )}
            </Button>
          </Section>
        )}
      </div>

      {addrOpen && (
        <AddressFormModal
          initial={null}
          onSave={async (data: any) => {
            const created = await createAddress({
              receiverName: data.receiverName,
              receiverPhone: data.receiverPhone,
              address: data.address,
              ward: data.ward,
              district: data.district,
              city: data.city,
            });

            setAddresses((prev) => [...prev, created]);
            setSelectedAddress(created);

            setAddrOpen(false);

            toast.success("Thêm địa chỉ thành công");
          }}
          onClose={() => setAddrOpen(false)}
          title="Địa chỉ nhận hàng"
        />
      )}
    </div>
  );
}

// ── Sub Components ──────────────────────────────────────────────────────────
function Section({
  icon,
  iconBg,
  title,
  badge,
  right,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  badge?: number;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[18px] border border-[#ebebeb] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-[10px] ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>
          <span className="text-[14px] font-bold text-gray-900">{title}</span>
          {badge !== undefined && (
            <span className="bg-rose-500 text-white text-[11px] font-extrabold rounded-full px-2 py-0.5">
              {badge}
            </span>
          )}
        </div>
        {right}
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </div>
  );
}

function PayOption({
  selected,
  onClick,
  iconBg,
  icon,
  name,
  desc,
  disabled,
  soon,
}: {
  selected: boolean;
  onClick?: () => void;
  iconBg: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
  disabled?: boolean;
  soon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 p-3 rounded-2xl border-[1.5px] w-full text-left transition-all ${
        selected ? "border-rose-400 bg-rose-50/50" : "border-gray-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-200"}`}
    >
      <div
        className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-bold text-gray-900">{name}</p>
        <p className="text-[11.5px] text-gray-400 mt-0.5">{desc}</p>
      </div>
      {soon && (
        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
          Sắp ra mắt
        </span>
      )}
      {!disabled && (
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            selected ? "border-rose-500" : "border-gray-200"
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
        </div>
      )}
    </button>
  );
}

function SumRow({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13.5px] text-gray-500">{label}</span>
      <span
        className={`text-[13.5px] font-semibold ${green ? "text-green-600" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
