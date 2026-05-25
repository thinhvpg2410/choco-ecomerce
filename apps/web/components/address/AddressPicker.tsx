"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Loader2, Search, MapPin } from "lucide-react";

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
  const [selWard, setSelWard] = useState<Ward | null>(value?.ward ?? null);
  const [tab, setTab] = useState<AddrTab>("tinh");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/p")
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => {});
  }, []);

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
    onChange({ province: p, ward: null });
  };

  const onSelectWard = (w: Ward) => {
    setSelWard(w);
    setOpen(false);
    setSearch("");
    if (selProvince) onChange({ province: selProvince, ward: w });
  };

  const triggerText = [selProvince?.name, selWard?.name]
    .filter(Boolean)
    .join(" › ");

  const filteredProvinces = useMemo(
    () =>
      provinces.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [provinces, search],
  );
  const filteredWards = useMemo(
    () =>
      wards.filter((w) => w.name.toLowerCase().includes(search.toLowerCase())),
    [wards, search],
  );

  return (
    <>
      <style>{`
        .ap-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #1e293b;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          text-align: left;
        }
        .ap-trigger:hover { border-color: #be123c; }
        .ap-trigger.open {
          border-color: #be123c;
          box-shadow: 0 0 0 3px rgba(190,18,60,0.08);
        }
        .ap-trigger-placeholder { color: #94a3b8; }
        .ap-dropdown {
          position: absolute;
          left: 0; right: 0;
          top: calc(100% + 6px);
          z-index: 30;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(15,23,42,0.12);
          overflow: hidden;
          animation: apDropIn 0.16s cubic-bezier(0.22,0.68,0,1.1) both;
        }
        @keyframes apDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ap-tabs {
          display: flex;
          border-bottom: 1px solid #f1f5f9;
        }
        .ap-tab {
          flex: 1;
          padding: 10px 8px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #94a3b8;
          transition: color 0.15s, border-color 0.15s;
        }
        .ap-tab.active { color: #be123c; border-bottom-color: #be123c; }
        .ap-tab:disabled { opacity: 0.4; cursor: not-allowed; }
        .ap-search-wrap {
          padding: 10px;
          border-bottom: 1px solid #f1f5f9;
        }
        .ap-search {
          width: 100%;
          padding: 8px 10px 8px 34px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s;
        }
        .ap-search:focus { border-color: #be123c; background: #fff; }
        .ap-search::placeholder { color: #94a3b8; }
        .ap-list { max-height: 216px; overflow-y: auto; }
        .ap-item {
          width: 100%;
          text-align: left;
          padding: 9px 16px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #334155;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
          border-left: 3px solid transparent;
        }
        .ap-item:hover { background: #fdf2f4; color: #be123c; }
        .ap-item.selected {
          background: #fdf2f4;
          color: #be123c;
          font-weight: 700;
          border-left-color: #be123c;
        }
        .ap-empty {
          padding: 28px 16px;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`ap-trigger${open ? " open" : ""}`}
        >
          <MapPin
            style={{
              width: 15,
              height: 15,
              color: open || triggerText ? "#be123c" : "#94a3b8",
              flexShrink: 0,
            }}
          />
          <span
            className={triggerText ? "" : "ap-trigger-placeholder"}
            style={{ flex: 1 }}
          >
            {triggerText || "Chọn Tỉnh/TP → Phường/Xã"}
          </span>
          <ChevronDown
            style={{
              width: 15,
              height: 15,
              color: "#94a3b8",
              flexShrink: 0,
              transition: "transform 0.2s",
              transform: open ? "rotate(180deg)" : "rotate(0)",
            }}
          />
        </button>

        {open && (
          <div className="ap-dropdown">
            <div className="ap-tabs">
              {(["tinh", "phuong"] as AddrTab[]).map((t, idx) => {
                const labels = ["Tỉnh / Thành phố", "Phường / Xã"];
                const disabled = t === "phuong" && !selProvince;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) {
                        setTab(t);
                        setSearch("");
                      }
                    }}
                    className={`ap-tab${tab === t ? " active" : ""}`}
                  >
                    {labels[idx]}
                  </button>
                );
              })}
            </div>

            <div className="ap-search-wrap">
              <div style={{ position: "relative" }}>
                <Search
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 14,
                    height: 14,
                    color: "#94a3b8",
                  }}
                />
                <input
                  className="ap-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    tab === "tinh"
                      ? "Tìm tỉnh / thành phố..."
                      : "Tìm phường / xã..."
                  }
                />
              </div>
            </div>

            <div className="ap-list">
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "28px",
                    gap: 8,
                    color: "#be123c",
                  }}
                >
                  <Loader2
                    style={{
                      width: 16,
                      height: 16,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Đang tải...
                  </span>
                </div>
              ) : (
                <>
                  {tab === "tinh" &&
                    filteredProvinces.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => onSelectProvince(p)}
                        className={`ap-item${selProvince?.code === p.code ? " selected" : ""}`}
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
                        className={`ap-item${selWard?.code === w.code ? " selected" : ""}`}
                      >
                        {w.name}
                      </button>
                    ))}
                  {!loading &&
                    ((tab === "tinh" && filteredProvinces.length === 0) ||
                      (tab === "phuong" && filteredWards.length === 0)) && (
                      <div className="ap-empty">Không tìm thấy kết quả</div>
                    )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
