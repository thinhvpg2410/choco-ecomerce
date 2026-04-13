"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddressPicker, type AddressSelection } from "./AddressPicker";
import { toast } from "sonner";

export interface AddressFormData {
  receiver_name: string;
  receiver_phone: string;
  address: string; // số nhà, tên đường
  ward: string;
  district: string;
  city: string;
}

interface Props {
  initial?: Partial<AddressFormData> | null;
  onSave: (data: AddressFormData) => Promise<void>;
  onClose: () => void;
  title?: string;
}

export function AddressFormModal({
  initial,
  onSave,
  onClose,
  title = "Địa chỉ nhận hàng",
}: Props) {
  const [receiverName, setReceiverName] = useState(
    initial?.receiver_name ?? "",
  );
  const [receiverPhone, setReceiverPhone] = useState(
    initial?.receiver_phone ?? "",
  );
  const [addrDetail, setAddrDetail] = useState(initial?.address ?? "");
  const [addrSel, setAddrSel] = useState<AddressSelection | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!receiverName.trim()) {
      toast.error("Nhập họ tên người nhận");
      return;
    }
    if (!receiverPhone.trim()) {
      toast.error("Nhập số điện thoại");
      return;
    }
    if (!addrSel) {
      toast.error("Chọn tỉnh / quận / phường");
      return;
    }
    if (!addrDetail.trim()) {
      toast.error("Nhập số nhà, tên đường");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        address: addrDetail,
        ward: addrSel.ward.name,
        district: addrSel.district.name,
        city: addrSel.province.name,
      });
      onClose();
    } catch {
      toast.error("Lưu địa chỉ thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Điền đầy đủ để chúng tôi giao đúng nơi
        </p>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              placeholder="Họ và tên người nhận"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="rounded-xl text-sm"
            />
            <Input
              placeholder="Số điện thoại"
              type="tel"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              className="rounded-xl text-sm"
            />
          </div>

          {/* Dropdown tỉnh/huyện/xã */}
          <AddressPicker value={addrSel} onChange={setAddrSel} />

          <Input
            placeholder="Số nhà, tên đường, tòa nhà..."
            value={addrDetail}
            onChange={(e) => setAddrDetail(e.target.value)}
            className="rounded-xl text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-sm"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold"
          >
            {saving ? "Đang lưu..." : "Lưu địa chỉ"}
          </Button>
        </div>
      </div>
    </div>
  );
}
