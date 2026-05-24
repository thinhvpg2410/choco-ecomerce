"use client";

import { MapPin } from "lucide-react";

import Section from "./Section";

import type { UserAddress } from "@/types/type";

type Props = {
  addresses: UserAddress[];
  selectedAddress: UserAddress | null;
  setSelectedAddress: (addr: UserAddress) => void;
  setAddrOpen: (open: boolean) => void;
};

export default function AddressSection({
  addresses,
  selectedAddress,
  setSelectedAddress,
  setAddrOpen,
}: Props) {
  return (
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
            <p className="text-sm text-gray-400">Chưa có địa chỉ giao hàng</p>
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
                <div
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    active ? "border-rose-500" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  )}
                </div>

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
                    {addr.address}, {addr.ward}, {addr.city}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
