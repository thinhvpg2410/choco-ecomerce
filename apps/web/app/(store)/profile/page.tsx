"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { login } from "@/store/authSlice";
import {
  getMe,
  updateMe,
  uploadAvatar,
  type UpdateUserPayload,
} from "@/services/user.service";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/services/user-address.service";
import type { UserAddress } from "@/types/type";
import {
  AddressFormModal,
  type AddressFormData,
} from "@/components/address/AddressModal";
import {
  Pencil,
  Trash2,
  Plus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Camera,
  X,
  RotateCcw,
  User,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

function Initials({ name, size = 88 }: { name?: string; size?: number }) {
  const letter = name?.charAt(0).toUpperCase() ?? "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "linear-gradient(145deg, #be123c 0%, #9f1239 100%)",
        color: "#fff",
        fontWeight: 700,
        fontFamily: "'Playfair Display', serif",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        letterSpacing: "-0.02em",
        userSelect: "none",
      }}
    >
      {letter}
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const reduxUser = useSelector((s: RootState) => s.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedProfile, setSavedProfile] = useState<UpdateUserPayload>({
    username: "",
    phone: "",
    dob: "",
    gender: undefined,
    avatar_url: "",
  });
  const [savedAvatarUrl, setSavedAvatarUrl] = useState("");
  const [profile, setProfile] = useState<UpdateUserPayload>({
    username: "",
    phone: "",
    dob: "",
    gender: undefined,
    avatar_url: "",
  });
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string>("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<UserAddress | null>(null);

  useEffect(() => {
    getMe().then((u) => {
      const p = {
        username: u.username ?? "",
        phone: u.phone ?? "",
        dob: u.dob ? new Date(u.dob).toISOString().split("T")[0] : "",
        gender: (u.gender as any) ?? undefined,
        avatar_url: u.avatar_url ?? "",
      };
      setSavedProfile(p);
      setProfile(p);
      setSavedAvatarUrl(u.avatar_url ?? "");
    });
    getAddresses()
      .then(setAddresses)
      .finally(() => setAddrLoading(false));
  }, []);

  const checkDirty = (
    newProfile: UpdateUserPayload,
    hasPendingAvatar: boolean,
  ) => {
    setIsDirty(
      hasPendingAvatar ||
        newProfile.username !== savedProfile.username ||
        newProfile.phone !== savedProfile.phone ||
        newProfile.dob !== savedProfile.dob ||
        newProfile.gender !== savedProfile.gender,
    );
  };

  const updateProfile = (updates: Partial<UpdateUserPayload>) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    checkDirty(next, !!pendingAvatarFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    const url = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setPendingAvatarPreview(url);
    checkDirty(profile, true);
    // Reset input so same file can be re-selected after cancel
    e.target.value = "";
  };

  const handleCancelAvatar = () => {
    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    setPendingAvatarFile(null);
    setPendingAvatarPreview("");
    checkDirty(profile, false);
  };

  const handleDiscard = () => {
    handleCancelAvatar();
    setProfile(savedProfile);
    setIsDirty(false);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      let finalAvatarUrl = profile.avatar_url;
      if (pendingAvatarFile) {
        const updatedUser = await uploadAvatar(pendingAvatarFile);
        finalAvatarUrl = updatedUser.avatar_url ?? "";
        if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
        setPendingAvatarFile(null);
        setPendingAvatarPreview("");
        setSavedAvatarUrl(finalAvatarUrl ?? "");
      }
      const updated = await updateMe({
        ...profile,
        avatar_url: finalAvatarUrl || undefined,
        dob: profile.dob || undefined,
        gender: profile.gender || undefined,
      });
      dispatch(login(updated as any));
      const newSaved = {
        username: updated.username ?? "",
        phone: updated.phone ?? "",
        dob: updated.dob
          ? new Date(updated.dob).toISOString().split("T")[0]
          : "",
        gender: (updated.gender as any) ?? undefined,
        avatar_url: updated.avatar_url ?? "",
      };
      setSavedProfile(newSaved);
      setProfile(newSaved);
      setSavedAvatarUrl(updated.avatar_url ?? "");
      setIsDirty(false);
      setProfileMsg({ type: "ok", text: "Cập nhật thành công!" });
    } catch {
      setProfileMsg({ type: "err", text: "Cập nhật thất bại." });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const handleSaveAddress = async (data: AddressFormData) => {
    try {
      const payload = {
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        address: data.address,
        ward: data.ward,
        city: data.city,
      };
      if (editingAddr) {
        const updated = await updateAddress(editingAddr.id, payload);
        setAddresses((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
      } else {
        const created = await createAddress(payload);
        setAddresses((prev) => [...prev, created]);
      }
      setModalOpen(false);
      setEditingAddr(null);
    } catch (error: any) {
      console.error("SAVE ADDRESS ERROR:", error);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const avatarSrc = pendingAvatarPreview || savedAvatarUrl;
  const displayName =
    savedProfile.username || reduxUser?.email || "Chưa đặt tên";
  const isAdmin = reduxUser?.role === "admin";

  return (
    <ProtectedRoute>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --red: #be123c;
          --red-dark: #9f1239;
          --red-soft: #fff0f3;
          --red-border: #fecdd3;
          --ink: #0f172a;
          --ink-2: #334155;
          --ink-3: #64748b;
          --ink-4: #94a3b8;
          --surface: #ffffff;
          --surface-2: #f8fafc;
          --surface-3: #f1f5f9;
          --border: #e2e8f0;
          --border-2: #cbd5e1;
          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 20px;
          --shadow-sm: 0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
          --shadow-md: 0 4px 16px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04);
          --shadow-lg: 0 12px 40px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06);
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'Outfit', system-ui, sans-serif;
        }

        .pp-root {
          font-family: var(--font-body);
          min-height: 100vh;
          background: #f0f4f8;
          padding: 40px 0 80px;
        }

        /* ── CARD ── */
        .pp-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }

        /* ── SECTION HEADER (inside card, no cover) ── */
        .pp-section-head {
          padding: 24px 28px 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .pp-section-title {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 500;
          color: var(--ink);
          margin: 0 0 3px;
          letter-spacing: -0.01em;
        }
        .pp-section-sub {
          font-size: 12.5px;
          color: var(--ink-4);
          margin: 0;
          font-weight: 400;
        }

        /* ── AVATAR ROW ── */
        .pp-avatar-row {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 24px 28px 0;
        }
        .pp-avatar-ring {
          position: relative;
          flex-shrink: 0;
          width: 88px;
          height: 88px;
          border-radius: 50%;
          box-shadow: 0 0 0 3px var(--surface), 0 0 0 5px var(--red-border);
        }
        .pp-avatar-img {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
        .pp-avatar-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--red);
          border: 2px solid var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s;
          color: #fff;
        }
        .pp-avatar-btn:hover { background: var(--red-dark); transform: scale(1.1); }

        .pp-avatar-info { flex: 1; min-width: 0; }
        .pp-name {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 500;
          color: var(--ink);
          margin: 0 0 6px;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pp-badge {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .pp-badge-admin { background: #f3e8ff; color: #6d28d9; border: 1px solid #ddd6fe; }
        .pp-badge-member { background: var(--red-soft); color: var(--red); border: 1px solid var(--red-border); }

        /* pending avatar banner */
        .pp-pending-banner {
          margin: 14px 28px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          color: #92400e;
          font-weight: 500;
        }
        .pp-pending-thumb {
          width: 32px; height: 32px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid #fbbf24;
        }
        .pp-pending-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pp-cancel-btn {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: var(--surface);
          border: 1px solid #fca5a5;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: #dc2626;
          cursor: pointer;
          font-family: var(--font-body);
          transition: background 0.13s;
          flex-shrink: 0;
        }
        .pp-cancel-btn:hover { background: #fef2f2; }

        /* ── DIVIDER ── */
        .pp-divider {
          height: 1px;
          background: var(--border);
          margin: 22px 0 0;
        }

        /* ── FORM BODY ── */
        .pp-body { padding: 22px 28px 28px; }

        .pp-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 7px;
        }
        .pp-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 13.5px;
          font-family: var(--font-body);
          background: var(--surface-2);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--ink);
          outline: none;
          transition: border-color 0.16s, box-shadow 0.16s, background 0.16s;
          box-sizing: border-box;
          font-weight: 400;
        }
        .pp-input:focus {
          border-color: var(--red);
          background: var(--surface);
          box-shadow: 0 0 0 3px rgba(190,18,60,0.08);
        }
        .pp-input:disabled {
          background: var(--surface-3);
          color: var(--ink-4);
          cursor: not-allowed;
          border-color: var(--border);
        }
        .pp-input::placeholder { color: var(--ink-4); }

        .pp-gender-btn {
          flex: 1;
          padding: 9px 8px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-body);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface-2);
          color: var(--ink-3);
          cursor: pointer;
          transition: all 0.15s;
        }
        .pp-gender-btn:hover { border-color: var(--red); color: var(--red); background: var(--red-soft); }
        .pp-gender-btn.active {
          border-color: var(--red);
          background: var(--red-soft);
          color: var(--red);
          font-weight: 600;
        }

        /* ── ACTION ROW ── */
        .pp-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--border);
        }
        .pp-msg {
          margin-right: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 500;
        }
        .pp-save-btn {
          padding: 9px 22px;
          background: var(--red);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          letter-spacing: 0.01em;
          box-shadow: 0 2px 8px rgba(190,18,60,0.22);
          transition: background 0.15s, transform 0.12s, box-shadow 0.15s;
        }
        .pp-save-btn:hover:not(:disabled) {
          background: var(--red-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(190,18,60,0.3);
        }
        .pp-save-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .pp-discard-btn {
          padding: 9px 16px;
          background: transparent;
          color: var(--ink-3);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-body);
          cursor: pointer;
          transition: all 0.14s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .pp-discard-btn:hover { border-color: var(--border-2); color: var(--ink); background: var(--surface-2); }

        /* ── ADDRESS ── */
        .pp-addr-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 15px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface-2);
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          position: relative;
        }
        .pp-addr-row:hover {
          border-color: var(--border-2);
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }
        .pp-addr-icon {
          width: 36px; height: 36px;
          flex-shrink: 0;
          border-radius: 10px;
          background: var(--red-soft);
          border: 1px solid var(--red-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pp-addr-actions {
          display: flex;
          gap: 5px;
          opacity: 0;
          transition: opacity 0.14s;
          flex-shrink: 0;
        }
        .pp-addr-row:hover .pp-addr-actions { opacity: 1; }
        .pp-icon-btn {
          width: 30px; height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--border);
          border-radius: 7px;
          background: var(--surface);
          cursor: pointer;
          color: var(--ink-4);
          transition: all 0.13s;
        }
        .pp-icon-btn:hover { border-color: var(--red); background: var(--red-soft); color: var(--red); }
        .pp-icon-btn.del:hover { border-color: #fca5a5; background: #fef2f2; color: #dc2626; }

        .pp-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--red);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(190,18,60,0.22);
          transition: background 0.14s, transform 0.12s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .pp-add-btn:hover { background: var(--red-dark); transform: translateY(-1px); }

        .pp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 44px 24px;
          text-align: center;
        }
        .pp-empty-icon {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: var(--surface-2);
          border: 1.5px dashed var(--border-2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .pp-skeleton {
          height: 68px;
          border-radius: var(--radius-md);
          background: linear-gradient(90deg, #f1f5f9 25%, #e8eef7 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="pp-root">
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* PAGE HEADER */}
          <div style={{ paddingLeft: 4 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "26px",
                fontWeight: 500,
                color: "var(--ink)",
                margin: "0 0 4px",
                letterSpacing: "-0.02em",
              }}
            >
              Tài khoản của tôi
            </h1>
            <p style={{ fontSize: "13px", color: "var(--ink-3)", margin: 0 }}>
              Quản lý thông tin cá nhân và địa chỉ giao hàng
            </p>
          </div>

          {/* ── PROFILE CARD ── */}
          <div className="pp-card">
            {/* Avatar + name row */}
            <div className="pp-avatar-row">
              <div className="pp-avatar-ring">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="pp-avatar-img" />
                ) : (
                  <Initials name={displayName} size={88} />
                )}
                <button
                  className="pp-avatar-btn"
                  title="Đổi ảnh đại diện"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div className="pp-avatar-info">
                <p className="pp-name">{displayName}</p>
                <span
                  className={
                    isAdmin
                      ? "pp-badge pp-badge-admin"
                      : "pp-badge pp-badge-member"
                  }
                >
                  {isAdmin ? "Admin" : "Thành viên"}
                </span>
              </div>
            </div>

            {/* Pending avatar banner — only when a new file is staged */}
            {pendingAvatarFile && (
              <div className="pp-pending-banner">
                <div className="pp-pending-thumb">
                  <img src={pendingAvatarPreview} alt="preview" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "12.5px" }}>
                    Ảnh mới đã chọn
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "11.5px", color: "#b45309" }}
                  >
                    Nhấn "Lưu thay đổi" để cập nhật
                  </p>
                </div>
                <button className="pp-cancel-btn" onClick={handleCancelAvatar}>
                  <X style={{ width: 11, height: 11 }} /> Hủy ảnh
                </button>
              </div>
            )}

            <div className="pp-divider" />

            {/* Form */}
            <div className="pp-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px 22px",
                }}
              >
                <div>
                  <label className="pp-label">Tên hiển thị</label>
                  <input
                    className="pp-input"
                    value={profile.username ?? ""}
                    onChange={(e) =>
                      updateProfile({ username: e.target.value })
                    }
                    placeholder="Nhập tên..."
                  />
                </div>
                <div>
                  <label className="pp-label">Email</label>
                  <input
                    className="pp-input"
                    value={reduxUser?.email ?? ""}
                    disabled
                  />
                </div>
                <div>
                  <label className="pp-label">Số điện thoại</label>
                  <input
                    className="pp-input"
                    value={profile.phone ?? ""}
                    onChange={(e) => updateProfile({ phone: e.target.value })}
                    placeholder="0901 234 567"
                  />
                </div>
                <div>
                  <label className="pp-label">Ngày sinh</label>
                  <input
                    type="date"
                    className="pp-input"
                    value={profile.dob ?? ""}
                    onChange={(e) => updateProfile({ dob: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="pp-label">Giới tính</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { value: "male", label: "Nam" },
                      { value: "female", label: "Nữ" },
                      { value: "other", label: "Khác" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          updateProfile({ gender: opt.value as any })
                        }
                        className={`pp-gender-btn${profile.gender === opt.value ? " active" : ""}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="pp-actions">
                {profileMsg && (
                  <span
                    className="pp-msg"
                    style={{
                      color: profileMsg.type === "ok" ? "#15803d" : "#dc2626",
                    }}
                  >
                    {profileMsg.type === "ok" ? (
                      <CheckCircle2 style={{ width: 14, height: 14 }} />
                    ) : (
                      <AlertCircle style={{ width: 14, height: 14 }} />
                    )}
                    {profileMsg.text}
                  </span>
                )}
                {isDirty && (
                  <button
                    className="pp-discard-btn"
                    onClick={handleDiscard}
                    disabled={profileSaving}
                  >
                    <RotateCcw style={{ width: 12, height: 12 }} /> Hủy thay đổi
                  </button>
                )}
                <button
                  className="pp-save-btn"
                  onClick={handleSaveProfile}
                  disabled={profileSaving || !isDirty}
                >
                  {profileSaving ? "Đang lưu…" : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>

          {/* ── ADDRESS CARD ── */}
          <div className="pp-card">
            <div className="pp-section-head">
              <div>
                <h2 className="pp-section-title">Địa chỉ giao hàng</h2>
                <p className="pp-section-sub">
                  Quản lý danh sách địa chỉ nhận hàng
                </p>
              </div>
              <button
                className="pp-add-btn"
                onClick={() => {
                  setEditingAddr(null);
                  setModalOpen(true);
                }}
              >
                <Plus style={{ width: 13, height: 13 }} /> Thêm địa chỉ
              </button>
            </div>

            <div className="pp-divider" />

            <div style={{ padding: "16px 24px 24px" }}>
              {addrLoading ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[1, 2].map((i) => (
                    <div key={i} className="pp-skeleton" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="pp-empty">
                  <div className="pp-empty-icon">
                    <MapPin
                      style={{ width: 20, height: 20, color: "var(--ink-4)" }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "var(--ink-2)",
                      margin: "0 0 4px",
                    }}
                  >
                    Chưa có địa chỉ nào
                  </p>
                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "var(--ink-4)",
                      margin: 0,
                    }}
                  >
                    Thêm địa chỉ để đặt hàng nhanh hơn
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {addresses.map((addr) => (
                    <div key={addr.id} className="pp-addr-row">
                      <div className="pp-addr-icon">
                        <MapPin
                          style={{ width: 15, height: 15, color: "var(--red)" }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "var(--ink)",
                            }}
                          >
                            {addr.receiverName}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--ink-3)",
                              padding: "2px 8px",
                              background: "var(--surface-3)",
                              borderRadius: "5px",
                              fontWeight: 500,
                            }}
                          >
                            {addr.receiverPhone}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--ink-4)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {addr.address}, {addr.ward}, {addr.city}
                        </p>
                      </div>
                      <div className="pp-addr-actions">
                        <button
                          className="pp-icon-btn"
                          onClick={() => {
                            setEditingAddr(addr);
                            setModalOpen(true);
                          }}
                        >
                          <Pencil style={{ width: 12, height: 12 }} />
                        </button>
                        <button
                          className="pp-icon-btn del"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {modalOpen && (
          <AddressFormModal
            initial={
              editingAddr
                ? {
                    receiver_name: editingAddr.receiverName,
                    receiver_phone: editingAddr.receiverPhone,
                    address: editingAddr.address,
                    ward: editingAddr.ward,
                    city: editingAddr.city,
                  }
                : null
            }
            onSave={handleSaveAddress}
            onClose={() => {
              setModalOpen(false);
              setEditingAddr(null);
            }}
            title={editingAddr ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
