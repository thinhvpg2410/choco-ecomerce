"use client";

import { Tag, X, Ticket } from "lucide-react";
import Section from "./Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Voucher = {
  code: string;
  discount: number;
  finalAmount: number;
  description?: string;
};

type Props = {
  voucherInput: string;
  setVoucherInput: (value: string) => void;
  applyVoucher: () => void;
  appliedVouchers: Voucher[];
  setAppliedVouchers: React.Dispatch<React.SetStateAction<Voucher[]>>;
  fmt: (n: number) => string;
};

export default function VoucherSection({
  voucherInput,
  setVoucherInput,
  applyVoucher,
  appliedVouchers,
  setAppliedVouchers,
  fmt,
}: Props) {
  return (
    <Section
      icon={<Ticket className="w-4 h-4 text-violet-500" />}
      iconBg="bg-violet-50"
      title="Mã giảm giá"
    >
      <div className="flex gap-2">
        <Input
          placeholder="Nhập mã voucher..."
          value={voucherInput}
          onChange={(e) => setVoucherInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyVoucher()}
          className="rounded-xl text-sm border-gray-200 focus-visible:ring-orange-400 uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
        />
        <Button
          onClick={applyVoucher}
          className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-5 shrink-0"
        >
          Áp dụng
        </Button>
      </div>

      {appliedVouchers.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {appliedVouchers.map((voucher) => (
            <div
              key={voucher.code}
              className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-700 tracking-wide">
                    {voucher.code}
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-200 text-emerald-700 rounded-full px-2 py-0.5">
                    Đã áp dụng
                  </span>
                </div>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Giảm {fmt(voucher.discount)}
                </p>
              </div>
              <button
                onClick={() =>
                  setAppliedVouchers((prev) =>
                    prev.filter((v) => v.code !== voucher.code),
                  )
                }
                className="p-1 rounded-lg hover:bg-emerald-200 text-emerald-500 hover:text-emerald-700 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
