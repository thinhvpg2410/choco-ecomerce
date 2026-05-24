"use client";

import { ShoppingBag } from "lucide-react";

import Section from "./Section";

import type { CartItem } from "@/types/type";

type Props = {
  items: CartItem[];
  subtotal: number;
  fmt: (n: number) => string;
};

export default function OrderItemsSection({ items, subtotal, fmt }: Props) {
  return (
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
                src={item.image || "/placeholder.png"}
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
  );
}
