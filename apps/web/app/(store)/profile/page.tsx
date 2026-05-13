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
import ImageUpload from "@/components/upload/ImageUpload";
import { Camera, Pencil, Trash2, Plus, MapPin } from "lucide-react";

function Initials({ name, size = 96 }: { name?: string; size?: number }) {
  const letter = name?.charAt(0).toUpperCase() ?? "?";
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-gradient-to-br from-pink-100 to-pink-200 text-pink-500 font-bold flex items-center justify-center"
    >
      {letter}
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const reduxUser = useSelector((s: RootState) => s.auth.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UpdateUserPayload>({
    username: "",
    phone: "",
    dob: "",
    gender: undefined,
    avatar_url: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<UserAddress | null>(null);
  const [receiverPhone, setReceiverPhone] = useState("");
  const [addrDetail, setAddrDetail] = useState("");
  

  useEffect(() => {
    getMe().then((u) => {
      setProfile({
        username: u.username ?? "",
        phone: u.phone ?? "",
        dob: u.dob ? u.dob.slice(0, 10) : "",
        gender: (u.gender as any) ?? undefined,
        avatar_url: u.avatar_url ?? "",
      });
      setAvatarPreview(u.avatar_url ?? "");
    });
    getAddresses()
      .then(setAddresses)
      .finally(() => setAddrLoading(false));
  }, []);

//   useEffect(() => {
//   setReceiverName(initial?.receiver_name ?? "");
//   setReceiverPhone(initial?.receiver_phone ?? "");
//   setAddrDetail(initial?.address ?? "");
// }, [initial]);

  // Upload avatar
  const handleAvatarSelect = async (file: File) => {
    try {
      const updatedUser = await uploadAvatar(file);
      dispatch(login(updatedUser as any));
      setProfile((p) => ({ ...p, avatar_url: updatedUser.avatar_url }));
      setAvatarPreview(updatedUser.avatar_url ?? "");
    } catch (error) {
      console.error('Upload avatar failed:', error);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await updateMe({
        ...profile,
        dob: profile.dob || undefined,
        gender: profile.gender || undefined,
        avatar_url: profile.avatar_url || undefined,
      });
      dispatch(login(updated as any));
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
    if (editingAddr) {
      // UPDATE
      const updated = await updateAddress(editingAddr.id, {
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        address: data.address,
        ward: data.ward,
        district: data.district,
        city: data.city,
      });

      setAddresses((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    } else {
      // CREATE
const created = await createAddress({
  receiverName: data.receiverName,
  receiverPhone: data.receiverPhone,
  address: data.address,
  ward: data.ward,
  district: data.district,
  city: data.city,
});
      setAddresses((prev) => [...prev, created]);
    }

    // ✅ QUAN TRỌNG: reset UI
    setModalOpen(false);
    setEditingAddr(null);
  } catch (error) {
    console.error("Save address failed:", error);
  }
};

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white transition-shadow";
  const labelCls =
    "block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-gray-50/80 py-10">
      <div className="container mx-auto px-4 max-w-3xl flex flex-col gap-5">
        {/* ── HEADER ── */}
        <div className="mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Tài khoản</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Quản lý thông tin và địa chỉ giao hàng
          </p>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Cover strip */}
          <div className="h-24 bg-gradient-to-r from-pink-400 via-rose-300 to-orange-300" />

          {/* Avatar + name row */}
          <div className="px-6 pb-5">
            <div className="flex items-end gap-4 -mt-12 mb-5">
              {/* Avatar với ImageUpload */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Initials
                      name={profile.username || reduxUser?.email}
                      size={96}
                    />
                  )}
                </div>
              </div>

              {/* Name + role */}
              <div className="mb-1">
                <p className="text-base font-semibold text-gray-900 leading-tight">
                  {profile.username || "Chưa đặt tên"}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
                    reduxUser?.role === "admin"
                      ? "bg-purple-50 text-purple-600"
                      : "bg-pink-50 text-pink-500"
                  }`}
                >
                  {reduxUser?.role === "admin" ? "🛡 Admin" : "✦ Thành viên"}
                </span>
              </div>
            </div>

            {/* ImageUpload component */}
            <div className="mb-4">
              <ImageUpload
                onImageSelect={handleAvatarSelect}
                currentImageUrl={avatarPreview}
                label="Cập nhật avatar"
              />
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <label className={labelCls}>Tên hiển thị</label>
                <input
                  value={profile.username ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, username: e.target.value }))
                  }
                  placeholder="Nhập tên..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  value={reduxUser?.email ?? ""}
                  disabled
                  className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className={labelCls}>Số điện thoại</label>
                <input
                  value={profile.phone ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="0901234567"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Ngày sinh</label>
                <input
                  type="date"
                  value={profile.dob ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, dob: e.target.value }))
                  }
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Giới tính</label>
                <div className="flex gap-3">
                  {[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setProfile((p) => ({ ...p, gender: opt.value as any }))
                      }
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        profile.gender === opt.value
                          ? "border-pink-400 bg-pink-50 text-pink-600"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-50">
              {profileMsg && (
                <span
                  className={`text-sm ${profileMsg.type === "ok" ? "text-green-500" : "text-red-500"}`}
                >
                  {profileMsg.text}
                </span>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm"
              >
                {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>

        {/* ── ADDRESS CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Địa chỉ giao hàng
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Quản lý danh sách địa chỉ nhận hàng
              </p>
            </div>
            <button
              onClick={() => {
                setEditingAddr(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white px-3.5 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm địa chỉ
            </button>
          </div>

          {addrLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[72px] bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-pink-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Chưa có địa chỉ nào
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Thêm địa chỉ để đặt hàng nhanh hơn
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {addresses.map((addr, idx) => (
                <div
                  key={addr.id}
                  className="group flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-3.5 hover:border-pink-200 hover:bg-pink-50/30 transition-all"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-pink-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {addr.receiverName}
                      </p>

                      <span className="text-xs text-gray-400">
                        {addr.receiverPhone}
                      </span>
                      
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                    </p>
                  </div>

                  {/* Actions — hiện khi hover */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingAddr(addr);
                        setModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 flex items-center justify-center transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-pink-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="w-8 h-8 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  district: editingAddr.district,
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
  );
}
