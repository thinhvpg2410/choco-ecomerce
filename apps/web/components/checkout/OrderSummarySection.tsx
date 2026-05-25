"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import SumRow from "./SumRow";

type Voucher = { code: string; discount: number };

type Props = {
  itemsLength: number;
  subtotal: number;
  SHIPPING: number;
  appliedVouchers: Voucher[];
  total: number;
  fmt: (n: number) => string;
  placing: boolean;
  orderLocked: boolean;
  payMethod: "COD" | "PayPal" | "QR_BANK";
  selectedAddress: any;
  items: any[];
  cartItemIds: string[];
  note: string;
  isBuyNow: boolean;
  buyNowProduct: any;
  isHCM: boolean;
};

export default function OrderSummarySection({
  itemsLength, subtotal, SHIPPING, appliedVouchers, total, fmt,
  placing, orderLocked, payMethod,
  selectedAddress, items, cartItemIds, note, isBuyNow, buyNowProduct, isHCM,
}: Props) {
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    const checkoutData = {
      items, cartItemIds, selectedAddress, appliedVouchers, note,
      payMethod, subtotal, shipping: SHIPPING, total, isBuyNow, buyNowProduct, isHCM,
    };
    localStorage.setItem("payment_meta", JSON.stringify({ method: payMethod }));
    localStorage.setItem(
      "pending_checkout",
      JSON.stringify({
        ...checkoutData,
        shipping: SHIPPING, 
      }),
    );
    localStorage.setItem("cart_backup", JSON.stringify(items));
    router.push("/checkout/payment");
  };

  const totalDiscount = appliedVouchers.reduce((s, v) => s + v.discount, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900 tracking-tight">Tổng đơn hàng</p>
      </div>

      <div className="px-5 py-4 space-y-2.5">
        <SumRow label={`Tạm tính (${itemsLength} sản phẩm)`} value={fmt(subtotal)} />
        <SumRow
          label="Phí vận chuyển"
          value={SHIPPING === 0 ? "Miễn phí" : fmt(SHIPPING)}
          green={SHIPPING === 0}
        />
        {appliedVouchers.map((v) => (
          <SumRow key={v.code} label={`Voucher · ${v.code}`} value={`-${fmt(v.discount)}`} green />
        ))}

        <div className="pt-2 border-t border-dashed border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">Tổng thanh toán</span>
            <span className="text-2xl font-black text-orange-600" style={{ letterSpacing: "-0.03em" }}>
              {fmt(total)}
            </span>
          </div>
          {totalDiscount > 0 && (
            <p className="text-xs text-emerald-600 font-medium text-right mt-1">
              Tiết kiệm {fmt(totalDiscount)}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={handleContinue}
          disabled={placing || orderLocked}
          className={`
            w-full h-13 py-3.5 rounded-xl flex items-center justify-center gap-2
            text-sm font-bold text-white transition-all duration-150
            ${placing || orderLocked
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 active:scale-[0.99] shadow-md shadow-orange-200"
            }
          `}
        >
          {placing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              Tiếp tục thanh toán
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          Thanh toán bảo mật & mã hóa 256-bit
        </div>
      </div>
    </div>
  );
}
