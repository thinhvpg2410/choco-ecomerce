"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronRight, Loader2, Search } from "lucide-react";

interface Province {
  code: number;
  name: string;
  wards?: Ward[];
}

interface Ward {
  code: number;
  name: string;
}

type AddrTab = "tinh" | "phuong";

export interface AddressSelection {
  province: Province | null;
  ward: Ward | null;
}

interface Props {
  value?: AddressSelection | null;
  onChange: (sel: AddressSelection) => void;
}

export function AddressPicker({ value, onChange }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selProvince, setSelProvince] = useState<Province | null>(
    value?.province ?? null,
  );

  const [selWard, setSelWard] = useState<Ward | null>(
    value?.ward ?? null,
  );

  const [tab, setTab] = useState<AddrTab>("tinh");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // search
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (value) {
      setSelProvince(value.province);
      setSelWard(value.ward);
    } else {
      setSelProvince(null);
      setSelWard(null);
      setWards([]);
    }
  }, [value]);

  // Load provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/p")
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => {});
  }, []);

  // Reload wards when editing
  useEffect(() => {
    const loadData = async () => {
      if (value?.province) {
        try {
          const res = await fetch(
            `https://provinces.open-api.vn/api/v2/p/${value.province.code}?depth=2`,
          );

          const data = await res.json();
          setWards(data.wards ?? []);
        } catch (err) {
          console.error(err);
        }
      }
    };

    loadData();
  }, [value]);

  const onSelectProvince = async (p: Province) => {
    setSelProvince(p);
    setSelWard(null);
    setWards([]);
    setTab("phuong");
    setSearch("");

    setLoading(true);

    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/v2/p/${p.code}?depth=2`,
      );

      const data = await res.json();
      setWards(data.wards ?? []);
    } finally {
      setLoading(false);
    }

    onChange({
      province: p,
      ward: null,
    });
  };

  const onSelectWard = (w: Ward) => {
    setSelWard(w);
    setOpen(false);
    setSearch("");

    if (selProvince) {
      onChange({
        province: selProvince,
        ward: w,
      });
    }
  };

  const triggerText = [
    selProvince?.name,
    selWard?.name,
  ]
    .filter(Boolean)
    .join(" › ");

  const filteredProvinces = useMemo(() => {
    return provinces.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [provinces, search]);

  const filteredWards = useMemo(() => {
    return wards.filter((w) =>
      w.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [wards, search]);

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
          {triggerText || "Tỉnh / Thành phố → Phường / Xã"}
        </span>

        <ChevronRight
          className={`w-4 h-4 text-gray-300 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border-[1.5px] border-rose-400 rounded-xl overflow-hidden z-20 shadow-lg">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(["tinh", "phuong"] as AddrTab[]).map((t, idx) => {
              const labels = ["Tỉnh/TP", "Phường/Xã"];

              const disabled =
                t === "phuong" && !selProvince;

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      setTab(t);
                      setSearch("");
                    }
                  }}
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

          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  tab === "tinh"
                    ? "Tìm tỉnh/thành phố..."
                    : "Tìm phường/xã..."
                }
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 outline-none focus:border-rose-400 text-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
              </div>
            ) : (
              <>
                {tab === "tinh" &&
                  filteredProvinces.map((p) => (
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

                {tab === "phuong" &&
                  filteredWards.map((w) => (
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

                {!loading &&
                  ((tab === "tinh" &&
                    filteredProvinces.length === 0) ||
                    (tab === "phuong" &&
                      filteredWards.length === 0)) && (
                    <div className="py-6 text-center text-sm text-gray-400">
                      Không tìm thấy dữ liệu
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
