"use client";

import { cn } from "@/lib/utils";
import { Tag, Truck, Percent, DollarSign, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CouponCardProps {
  id: string;
  code: string;
  coupon_type: "PERCENT" | "FIXED" | "FREE_SHIP";
  discount_percent?: number;
  discount_amount?: number;
  min_order_amount: number;
  expiration_date: string;
  is_active: boolean;
  max_uses?: number;
  current_uses?: number;
  className?: string;
}

const typeConfig = {
  PERCENT: {
    label: "Giảm %",
    icon: Percent,
    gradient: "from-violet-600 to-purple-700",
    badgeBg: "bg-violet-100 text-violet-700",
    accentColor: "#7c3aed",
  },
  FIXED: {
    label: "Giảm tiền",
    icon: DollarSign,
    gradient: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-100 text-emerald-700",
    accentColor: "#059669",
  },
  FREE_SHIP: {
    label: "Free Ship",
    icon: Truck,
    gradient: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-100 text-blue-700",
    accentColor: "#3b82f6",
  },
};
const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

export function CouponCard({
  code,
  coupon_type,
  discount_percent,
  discount_amount,
  min_order_amount,
  expiration_date,
  is_active,
  max_uses,
  current_uses = 0,
  className,
}: CouponCardProps) {
  const [copied, setCopied] = useState(false);
  const config = typeConfig[coupon_type];
  const Icon = config.icon;
  const usagePercent = max_uses
    ? Math.round((current_uses / max_uses) * 100)
    : 0;
  const isExpired = new Date(expiration_date) < new Date();
  const isUnavailable = !is_active || isExpired;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const discountLabel =
    coupon_type === "PERCENT"
      ? `Giảm ${discount_percent}%`
      : coupon_type === "FIXED"
        ? `Giảm ${formatVND(discount_amount || 0)}`
        : "🚚 Miễn phí vận chuyển";

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border border-border bg-white shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5",
        isUnavailable && "opacity-60 grayscale",
        className,
      )}
    >
      {/* Left colored strip */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b",
          config.gradient,
        )}
      />

      {/* Dashed divider holes */}
      <div className="absolute left-[4px] top-1/2 -translate-y-1/2 flex flex-col gap-1">
        <div className="w-3 h-3 rounded-full bg-muted border border-border -ml-1.5" />
      </div>

      <div className="pl-6 pr-4 pt-4 pb-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-xl bg-gradient-to-br",
                config.gradient,
              )}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <div
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  config.badgeBg,
                )}
              >
                {config.label}
              </div>
            </div>
          </div>
          {isExpired ? (
            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
              Hết hạn
            </span>
          ) : !is_active ? (
            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
              Vô hiệu
            </span>
          ) : (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              Còn hiệu lực
            </span>
          )}
        </div>

        {/* Discount value */}
        <div className="mb-3">
          <p className="text-2xl font-black text-foreground tracking-tight">
            {discountLabel}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đơn tối thiểu {formatVND(min_order_amount)}
          </p>
        </div>

        {/* Dashed separator */}
        <div className="border-t border-dashed border-border my-3" />

        {/* Code + copy */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 bg-muted rounded-lg px-3 py-2 border border-dashed border-border">
            <p className="text-sm font-mono font-bold tracking-widest text-foreground">
              {code}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
              copied
                ? "bg-green-500 text-white"
                : "bg-foreground text-background hover:opacity-80",
            )}
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Đã sao" : "Sao chép"}
          </button>
        </div>

        {/* Usage bar */}
        <div className="mt-3 min-h-[42px]">
          {max_uses ? (
            <>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Đã dùng: {current_uses}/{max_uses}
                </span>
                <span>{usagePercent}%</span>
              </div>

              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all",
                    config.gradient,
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </>
          ) : (
            <div className="h-full" />
          )}
        </div>

        {/* Expiration */}
        <p className="text-xs text-muted-foreground">
          HSD: {new Date(expiration_date).toLocaleDateString("vi-VN")}
        </p>
      </div>
    </div>
  );
}
