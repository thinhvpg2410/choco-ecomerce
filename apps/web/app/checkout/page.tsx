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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createOrder } from "@/services/order.service";
import { createPayment } from "@/services/payment.service";
import { getCart } from "@/services/cart.service";
import type { CartItem } from "@/types/type";
import {
  AddressFormModal,
  type AddressFormData,
} from "@/components/address/AddressModal";

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [addrOpen, setAddrOpen] = useState(false);
  const [savedAddr, setSavedAddr] = useState<AddressFormData | null>(null);

  const [voucherInput, setVoucherInput] = useState("");
  const [voucherApplied, setVoucherApplied] = useState<{
    code: string;
    discount: number;
    label: string;
  } | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [payMethod, setPayMethod] = useState<"COD">("COD");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("checkout_cart");

    if (data) {
      const parsed = JSON.parse(data);
      setItems(parsed.items ?? []);
    }

    setLoadingCart(false);
  }, []);

  const MOCK_VOUCHERS: Record<
    string,
    { pct?: number; fixed?: number; ship?: boolean }
  > = {
    SAVE20: { pct: 20 },
    CHOCO10: { pct: 10 },
    FREESHIP: { ship: true },
  };

  const SHIPPING = 30_000;
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmt = voucherApplied?.discount ?? 0;
  const total = subtotal + SHIPPING - discountAmt;
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const applyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) {
      setVoucherError("Vui lòng nhập mã");
      return;
    }
    const v = MOCK_VOUCHERS[code];
    if (!v) {
      setVoucherError("Mã không hợp lệ hoặc đã hết hạn");
      return;
    }
    const disc = v.ship
      ? SHIPPING
      : v.pct
        ? Math.round((subtotal * v.pct) / 100)
        : (v.fixed ?? 0);
    setVoucherApplied({
      code,
      discount: disc,
      label: v.ship
        ? "Miễn phí vận chuyển"
        : `-${v.pct ?? v.fixed}${v.pct ? "%" : "đ"}`,
    });
    setVoucherInput("");
    setVoucherError("");
    toast.success(`Áp dụng mã ${code} thành công!`);
  };

  const placeOrder = async () => {
    if (!savedAddr) {
      toast.error("Vui lòng thêm địa chỉ giao hàng");
      return;
    }
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    setPlacing(true);
    try {
      const shippingAddress = `${savedAddr.address}, ${savedAddr.ward}, ${savedAddr.district}, ${savedAddr.city}`;
      const order = await createOrder({
        receiver_name: savedAddr.receiver_name,
        receiver_phone: savedAddr.receiver_phone,
        shipping_address: shippingAddress,
        payment_method: payMethod,
        note: note || undefined,
      });
      await createPayment({ order_id: order.id, payment_method: payMethod });
      toast.success("Đặt hàng thành công!");
      router.push(`/order/${order.id}`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Đặt hàng thất bại, thử lại nhé!",
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

        {/* Địa chỉ */}
        <Section
          icon={<MapPin className="w-4 h-4 text-rose-500" />}
          iconBg="bg-rose-50"
          title="Địa chỉ giao hàng"
          right={
            <button
              onClick={() => setAddrOpen(true)}
              className="text-sm text-rose-500 font-bold"
            >
              Thay đổi
            </button>
          }
        >
          <button
            onClick={() => setAddrOpen(true)}
            className="flex items-center gap-3 w-full text-left py-1"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              {savedAddr ? (
                <>
                  <p className="text-[13.5px] font-bold text-gray-900">
                    {savedAddr.receiver_name} · {savedAddr.receiver_phone}
                  </p>
                  <p className="text-[12.5px] text-gray-500 truncate mt-0.5">
                    {savedAddr.address}, {savedAddr.ward}, {savedAddr.district},{" "}
                    {savedAddr.city}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[13.5px] font-medium text-gray-400">
                    Chưa có địa chỉ
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    Nhấn để thêm địa chỉ nhận hàng
                  </p>
                </>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
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
              disabled={!!voucherApplied}
            />
            <Button
              onClick={applyVoucher}
              disabled={!!voucherApplied}
              className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-5"
            >
              Áp dụng
            </Button>
          </div>
          {voucherError && (
            <p className="text-xs text-rose-500 mt-1.5">{voucherError}</p>
          )}
          {voucherApplied && (
            <div className="flex items-center gap-2 mt-2 bg-rose-50 border border-rose-200 rounded-full px-3 py-1.5 w-fit">
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-bold text-rose-600">
                {voucherApplied.code} · {voucherApplied.label}
              </span>
              <button
                onClick={() => setVoucherApplied(null)}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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
              name="Thanh toán khi nhận hàng"
              desc="Trả tiền mặt khi nhận · COD"
            />
            <PayOption
              selected={false}
              disabled
              iconBg="bg-violet-50"
              icon={<CreditCard className="w-4 h-4 text-violet-500" />}
              name="VNPay / Thẻ ngân hàng"
              desc="Thanh toán online qua VNPay"
              soon
            />
            <PayOption
              selected={false}
              disabled
              iconBg="bg-pink-50"
              icon={<CreditCard className="w-4 h-4 text-pink-500" />}
              name="Momo / ZaloPay"
              desc="Ví điện tử"
              soon
            />
          </div>
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

        {/* Tổng */}
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
            {voucherApplied && (
              <SumRow
                label="Giảm giá voucher"
                value={`-${fmt(voucherApplied.discount)}`}
                green
              />
            )}
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
            onClick={placeOrder}
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
      </div>

      {/* Modal địa chỉ dùng chung */}
      {addrOpen && (
        <AddressFormModal
          initial={savedAddr}
          onSave={async (data: any) => {
            setSavedAddr(data);
          }}
          onClose={() => setAddrOpen(false)}
          title="Địa chỉ nhận hàng"
        />
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
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
