"use client";

import { useState, useEffect } from "react";
import { X, MapPin, User, Phone, Home } from "lucide-react";
import { AddressPicker, type AddressSelection } from "./AddressPicker";
import { toast } from "sonner";

export interface AddressFormData {
  receiverName: string;
  receiverPhone: string;
  address: string;
  ward: string;
  city: string;
}

interface Props {
  initial?: {
    receiver_name?: string;
    receiver_phone?: string;
    address?: string;
    ward?: string;
    city?: string;
  } | null;
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

  useEffect(() => {
    if (initial?.city && initial?.ward) {
      setAddrSel({
        province: { code: 0, name: initial.city },
        ward: { code: 0, name: initial.ward },
      });
    }
  }, [initial]);

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
      toast.error("Chọn tỉnh/thành phố và phường/xã");
      return;
    }
    if (!addrDetail.trim()) {
      toast.error("Nhập số nhà, tên đường");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        receiverName,
        receiverPhone,
        address: addrDetail,
        ward: addrSel.ward?.name ?? "",
        city: addrSel.province?.name ?? "",
      });
      onClose();
    } catch {
      toast.error("Lưu địa chỉ thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        .modal-backdrop {
          animation: fadeIn 0.18s ease both;
        }
        .modal-card {
          animation: slideUp 0.24s cubic-bezier(0.22,0.68,0,1.1) both;
          font-family: 'DM Sans', sans-serif;
        }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .modal-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 6px;
        }
        .modal-input {
          width: 100%;
          padding: 10px 13px 10px 38px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .modal-input:focus {
          border-color: #be123c;
          box-shadow: 0 0 0 3px rgba(190,18,60,0.08);
        }
        .modal-input::placeholder { color: #94a3b8; }
        .modal-input-wrap { position: relative; }
        .modal-input-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          width: 15px; height: 15px;
          color: #94a3b8;
          pointer-events: none;
        }
        .modal-btn-primary {
          padding: 10px 24px;
          background: #be123c;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(190,18,60,0.25);
        }
        .modal-btn-primary:hover:not(:disabled) {
          background: #9f1239;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(190,18,60,0.32);
        }
        .modal-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-btn-secondary {
          padding: 10px 20px;
          background: #ffffff;
          color: #475569;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .modal-btn-secondary:hover { border-color: #94a3b8; color: #1e293b; }
      `}</style>

      <div
        className="modal-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(3px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="modal-card"
          style={{
            width: "100%",
            maxWidth: "480px",
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 24px 64px rgba(15,23,42,0.16)",
            overflow: "visible",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "19px",
                  color: "#0f172a",
                  fontWeight: 400,
                  marginBottom: "3px",
                }}
              >
                {title}
              </h2>
              <p style={{ fontSize: "12.5px", color: "#64748b" }}>
                Điền đầy đủ để chúng tôi giao đúng nơi
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#64748b",
                transition: "background 0.15s",
                flexShrink: 0,
                marginTop: 2,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e2e8f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f1f5f9")
              }
            >
              <X style={{ width: 15, height: 15 }} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label className="modal-label">Người nhận</label>
                <div className="modal-input-wrap">
                  <User className="modal-input-icon" />
                  <input
                    className="modal-input"
                    placeholder="Họ và tên..."
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="modal-label">Số điện thoại</label>
                <div className="modal-input-wrap">
                  <Phone className="modal-input-icon" />
                  <input
                    className="modal-input"
                    type="tel"
                    placeholder="0901 234 567"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="modal-label">Khu vực</label>
              <AddressPicker value={addrSel} onChange={setAddrSel} />
            </div>

            <div>
              <label className="modal-label">Địa chỉ chi tiết</label>
              <div className="modal-input-wrap">
                <Home className="modal-input-icon" />
                <input
                  className="modal-input"
                  placeholder="Số nhà, tên đường, tòa nhà..."
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "14px 24px 20px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <button className="modal-btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button
              className="modal-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu địa chỉ"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
