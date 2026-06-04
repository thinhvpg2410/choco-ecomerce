"use client";

import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Section from "@/components/checkout/Section";
import PayOption from "@/components/checkout/PayOption";
import OrderItemsSection from "@/components/checkout/OrderItemsSection";
import AddressSection from "@/components/checkout/AddressSection";
import VoucherSection from "@/components/checkout/VoucherSection";
import OrderSummarySection from "@/components/checkout/OrderSummarySection";

import { getAddresses, createAddress } from "@/services/user-address.service";
import { applyCoupon } from "@/services/coupon.service";
import type { UserAddress } from "@/types/type";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CartItem } from "@/types/type";
import {
  AddressFormModal,
  type AddressFormData,
} from "@/components/address/AddressModal";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CheckoutPage() {
  const router = useRouter();
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null,
  );
  const [orderLocked, setOrderLocked] = useState(false);
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const dispatch = useDispatch();
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<
    {
      code: string;
      discount: number;
      finalAmount: number;
      description?: string;
    }[]
  >([]);
  const [payMethod, setPayMethod] = useState<"COD" | "PayPal" | "QR_BANK">(
    "COD",
  );
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = localStorage.getItem("checkout_cart");
        if (data) {
          const parsed = JSON.parse(data);
          setCartItemIds(parsed.cart_item_ids ?? []);
          if (parsed.buy_now) {
            setBuyNowProduct({
              product_id: parsed.product_id,
              quantity: Number(parsed.quantity ?? 1),
            });
            setItems([
              {
                id: parsed.product_id,
                cart_id: "",
                product_id: parsed.product_id,
                created_at: "",
                name: parsed.name ?? "Sản phẩm",
                image: parsed.image ?? "",
                price: Number(parsed.price ?? 0),
                quantity: Number(parsed.quantity ?? 1),
              } as CartItem,
            ]);
          } else {
            setItems(parsed.items ?? []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCart(false);
      }
    };

    const loadAddresses = async () => {
      try {
        const res = await getAddresses();
        setAddresses(res);
        if (res.length > 0) setSelectedAddress(res[0]);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadData();
    loadAddresses();
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  // Thành này
  const HCM_KEYWORDS = [
    "hồ chí minh",
    "ho chi minh",
    "hcm",
    "tphcm",
    "tp.hcm",
    "tp hcm",
    "sài gòn",
    "sai gon",
  ];

  const isHCM = selectedAddress
    ? HCM_KEYWORDS.some((kw) => selectedAddress.city.toLowerCase().includes(kw))
    : false;

  const shippingFee = isHCM ? 15_000 : 30_000;

  const totalDiscount = appliedVouchers.reduce(
    (sum, item) => sum + item.discount,
    0,
  );
  const total = Math.max(0, subtotal + shippingFee - totalDiscount);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const applyVoucher = async () => {
  const code = voucherInput.trim().toUpperCase();
  if (!code) { toast.error("Vui lòng nhập mã giảm giá"); return; }
  if (appliedVouchers.some((v) => v.code === code)) {
    toast.error("Mã này đã được áp dụng"); return;
  }

  try {
    const couponData = await applyCoupon({ code, subtotal, shipping_fee: shippingFee });
    if (!couponData) { toast.error("Mã giảm giá không hợp lệ"); return; }

    setAppliedVouchers([{
      code: couponData.code,
      discount: couponData.discount_amount,
      finalAmount: couponData.final_amount,
      description: `Giảm ${fmt(couponData.discount_amount)} từ mã ${couponData.code}`,
    }]);
    setVoucherInput("");
    toast.success(`Áp dụng mã ${couponData.code} thành công!`);
  } catch (err: any) {
    const serverMessage = err?.response?.data?.message;
    if (Array.isArray(serverMessage)) toast.error(serverMessage[0]);
    else toast.error(serverMessage || "Không thể kết nối đến máy chủ");
  }
};

  if (loadingCart || loadingAddress) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F8]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
            <p className="text-sm text-gray-400 font-medium">
              Đang tải đơn hàng...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!items.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
          <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Không có sản phẩm
            </h2>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              Vui lòng chọn sản phẩm trong giỏ hàng để tiến hành thanh toán.
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <Button
                onClick={() => router.push("/cart")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11"
              >
                Quay lại giỏ hàng
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full rounded-xl h-11 text-gray-600"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F7F7F8]">
        {/* ── TOP BAR ── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-2 text-xs text-gray-400">
            <span
              className="text-orange-500 font-semibold cursor-pointer hover:text-orange-600"
              onClick={() => router.push("/cart")}
            >
              Giỏ hàng
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-gray-800">Đặt hàng</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Thanh toán</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            {/* ── LEFT COLUMN: FORM ── */}
            <div className="space-y-4">
              <OrderItemsSection items={items} subtotal={subtotal} fmt={fmt} />
              <AddressSection
                addresses={addresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                setAddrOpen={setAddrOpen}
              />
              <VoucherSection
                voucherInput={voucherInput}
                setVoucherInput={setVoucherInput}
                applyVoucher={applyVoucher}
                appliedVouchers={appliedVouchers}
                setAppliedVouchers={setAppliedVouchers}
                fmt={fmt}
              />

              {/* Payment method */}
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
                  <PayOption
                    selected={payMethod === "QR_BANK"}
                    onClick={() => setPayMethod("QR_BANK")}
                    iconBg="bg-emerald-50"
                    icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
                    name="Chuyển khoản ngân hàng (QR)"
                    desc="Quét QR để thanh toán nhanh"
                  />
                </div>
              </Section>

              {/* Note */}
              <Section
                icon={<MessageSquare className="w-4 h-4 text-gray-500" />}
                iconBg="bg-gray-100"
                title="Lời nhắn"
              >
                <Textarea
                  placeholder="Ghi chú cho người bán (tùy chọn)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-xl text-sm resize-none h-20 border-gray-200 focus-visible:ring-orange-400"
                />
              </Section>
            </div>

            {/* ── RIGHT COLUMN: SUMMARY STICKY ── */}
            <div className="lg:sticky lg:top-[60px]">
              <OrderSummarySection
                itemsLength={items.length}
                subtotal={subtotal}
                SHIPPING={shippingFee}
                appliedVouchers={appliedVouchers}
                total={total}
                fmt={fmt}
                placing={placing}
                orderLocked={orderLocked}
                payMethod={payMethod}
                selectedAddress={selectedAddress}
                items={items}
                cartItemIds={cartItemIds}
                note={note}
                isBuyNow={isBuyNow}
                buyNowProduct={buyNowProduct}
                isHCM={isHCM}
              />
            </div>
          </div>
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
    </ProtectedRoute>
  );
}
