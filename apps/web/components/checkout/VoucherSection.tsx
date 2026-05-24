"use client";

import { Tag, X } from "lucide-react";

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
      icon={<Tag className="w-4 h-4 text-violet-500" />}
      iconBg="bg-violet-50"
      title="Mã giảm giá"
    >
      <div className="flex gap-2">
        <Input
          placeholder="Nhập mã voucher..."
          value={voucherInput}
          onChange={(e) => setVoucherInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyVoucher()}
          className="rounded-xl text-sm flex-1"
        />

        <Button
          onClick={applyVoucher}
          className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-5"
        >
          Áp dụng
        </Button>
      </div>

      {appliedVouchers.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {appliedVouchers.map((voucher) => (
            <div
              key={voucher.code}
              className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 shadow-sm"
            >
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
                <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-rose-500" />
                </div>

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
                    <span className="text-xs text-gray-400">Số tiền giảm:</span>

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
  );
}
