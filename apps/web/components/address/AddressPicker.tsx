"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
}
interface Ward {
  code: number;
  name: string;
}
type AddrTab = "tinh" | "quan" | "phuong";

export interface AddressSelection {
  province: Province;
  district: District;
  ward: Ward;
}

interface Props {
  value?: AddressSelection | null;
  onChange: (sel: AddressSelection) => void;
}

export function AddressPicker({ value, onChange }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selProvince, setSelProvince] = useState<Province | null>(
    value?.province ?? null,
  );
  const [selDistrict, setSelDistrict] = useState<District | null>(
    value?.district ?? null,
  );
  const [selWard, setSelWard] = useState<Ward | null>(value?.ward ?? null);
  const [tab, setTab] = useState<AddrTab>("tinh");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => {});
  }, []);

  const onSelectProvince = async (p: Province) => {
  setSelProvince(p);
  setSelDistrict(null);
  setSelWard(null);
  setDistricts([]);
  setWards([]);
  setTab("quan");

  setLoading(true);
  try {
    const res = await fetch(
      `https://provinces.open-api.vn/api/p/${p.code}?depth=2`
    );
    const data = await res.json();
    setDistricts(data.districts ?? []);
  } finally {
    setLoading(false);
  }

  // 🔥 emit luôn (quan trọng)
  onChange({
    province: p,
    district: null as any,
    ward: null as any,
  });
};

  const onSelectDistrict = async (d: District) => {
  setSelDistrict(d);
  setSelWard(null);
  setWards([]);
  setTab("phuong");

  setLoading(true);
  try {
    const res = await fetch(
      `https://provinces.open-api.vn/api/d/${d.code}?depth=2`
    );
    const data = await res.json();
    setWards(data.wards ?? []);
  } finally {
    setLoading(false);
  }

  onChange({
    province: selProvince!,
    district: d,
    ward: null as any,
  });
};

  const onSelectWard = (w: Ward) => {
    setSelWard(w);
    setOpen(false);
    if (selProvince && selDistrict) {
      onChange({ province: selProvince, district: selDistrict, ward: w });
    }
  };

  const triggerText = [selProvince?.name, selDistrict?.name, selWard?.name]
    .filter(Boolean)
    .join(" › ");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 border-[1.5px] rounded-xl text-sm transition-colors ${
          open ? "border-rose-400" : "border-gray-200"
        } ${triggerText ? "text-gray-900" : "text-gray-400"} bg-white`}
      >
        <span>
          {triggerText || "Tỉnh / Thành phố → Quận / Huyện → Phường / Xã"}
        </span>
        <ChevronRight
          className={`w-4 h-4 text-gray-300 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border-[1.5px] border-rose-400 rounded-xl overflow-hidden z-20 shadow-lg">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["tinh", "quan", "phuong"] as AddrTab[]).map((t, idx) => {
              const labels = ["Tỉnh/TP", "Quận/Huyện", "Phường/Xã"];
              const disabled =
                (t === "quan" && !selProvince) ||
                (t === "phuong" && !selDistrict);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => !disabled && setTab(t)}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
                    tab === t
                      ? "text-rose-500 border-rose-500"
                      : "text-gray-400 border-transparent"
                  } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {labels[idx]}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="max-h-44 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
              </div>
            ) : (
              <>
                {tab === "tinh" &&
                  provinces.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => onSelectProvince(p)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 transition-colors ${
                        selProvince?.code === p.code
                          ? "text-rose-500 font-bold bg-rose-50"
                          : "text-gray-700"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                {tab === "quan" &&
                  districts.map((d) => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => onSelectDistrict(d)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 transition-colors ${
                        selDistrict?.code === d.code
                          ? "text-rose-500 font-bold bg-rose-50"
                          : "text-gray-700"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                {tab === "phuong" &&
                  wards.map((w) => (
                    <button
                      key={w.code}
                      type="button"
                      onClick={() => onSelectWard(w)}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 transition-colors ${
                        selWard?.code === w.code
                          ? "text-rose-500 font-bold bg-rose-50"
                          : "text-gray-700"
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
