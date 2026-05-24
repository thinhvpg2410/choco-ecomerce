"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CreditCard, Check, Loader2 } from "lucide-react";

import Section from "./Section";
import SumRow from "./SumRow";

import { Button } from "@/components/ui/button";

type Voucher = {
  code: string;
  discount: number;
};

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
  placeOrder: () => void;

  // dữ liệu cần để navigate sang payment page
  selectedAddress: any;
  items: any[];
  cartItemIds: string[];
  note: string;
  isBuyNow: boolean;
  buyNowProduct: any;
};

export default function OrderSummarySection({
  itemsLength,
  subtotal,
  SHIPPING,
  appliedVouchers,
  total,
  fmt,
  placing,
  orderLocked,
  payMethod,
  placeOrder,

  selectedAddress,
  items,
  cartItemIds,
  note,
  isBuyNow,
  buyNowProduct,
}: Props) {
  const router = useRouter();

  const goToPaymentPage = () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const checkoutData = {
      items,
      cartItemIds,
      selectedAddress,
      appliedVouchers,
      note,
      payMethod,
      subtotal,
      shipping: SHIPPING,
      total,
      isBuyNow,
      buyNowProduct,
    };

    localStorage.setItem("pending_checkout", JSON.stringify(checkoutData));

    router.push("/checkout/payment");
  };

  return (
    <Section
      icon={<CreditCard className="w-4 h-4 text-rose-500" />}
      iconBg="bg-rose-50"
      title="Chi tiết thanh toán"
    >
      <div className="flex flex-col gap-2.5">
        <SumRow
          label={`Tạm tính (${itemsLength} sản phẩm)`}
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
        onClick={() => {
          if (payMethod === "COD") {
            placeOrder();
          } else {
            goToPaymentPage();
          }
        }}
        disabled={placing || orderLocked}
        className="w-full mt-4 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-[15px] font-black tracking-tight flex items-center justify-center gap-2 transition-all active:scale-[.99]"
      >
        {placing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Đặt hàng · {fmt(total)}
          </>
        )}
      </Button>
    </Section>
  );
}
