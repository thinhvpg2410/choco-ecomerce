"use client";

import { MapPin, PlusCircle } from "lucide-react";
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
      icon={<MapPin className="w-4 h-4 text-orange-500" />}
      iconBg="bg-orange-50"
      title="Địa chỉ giao hàng"
      right={
        <button
          onClick={() => setAddrOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Thêm mới
        </button>
      }
    >
      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-0.5">
        {addresses.length === 0 && (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
            <MapPin className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Chưa có địa chỉ giao hàng</p>
          </div>
        )}
        {addresses.map((addr) => {
          const active = selectedAddress?.id === addr.id;
          return (
            <button
              key={addr.id}
              onClick={() => setSelectedAddress(addr)}
              className={`w-full text-left rounded-xl border p-3.5 transition-all duration-150 ${
                active
                  ? "border-orange-400 bg-orange-50/60"
                  : "border-gray-200 hover:border-orange-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? "border-orange-500" : "border-gray-300"}`}
                >
                  {active && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {addr.receiver_name || addr.receiverName}
                    </span>
                    <span className="text-gray-300 text-xs">|</span>
                    <span className="text-xs text-gray-500">
                      {addr.receiver_phone || addr.receiverPhone}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
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
