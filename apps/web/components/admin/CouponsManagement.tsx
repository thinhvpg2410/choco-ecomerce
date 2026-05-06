"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CouponCard } from "@/components/CouponCard";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/services/admin.service";

interface Coupon {
  id: string;
  code: string;
  coupon_type: "PERCENT" | "FIXED" | "FREE_SHIP";
  discount_percent?: number;
  discount_amount?: number;
  min_order_amount: number;
  expiration_date: string;
  is_active: boolean;
  max_uses?: number;
  current_uses?: number;
}

const defaultForm = {
  code: "",
  coupon_type: "PERCENT" as "PERCENT" | "FIXED" | "FREE_SHIP",
  discount_percent: "",
  discount_amount: "",
  min_order_amount: "",
  expiration_date: "",
  max_uses: "",
  is_active: true,
};

export function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadCoupons();
  }, []);

  const mapCoupon = (coupon: any): Coupon => ({
    id: coupon.id,
    code: coupon.code,
    coupon_type: coupon.couponType,
    discount_percent: coupon.discountPercent ?? undefined,
    discount_amount: coupon.discountAmount ?? undefined,
    min_order_amount: Number(coupon.minOrderAmount) || 0,
    expiration_date: coupon.expiryDate
      ? coupon.expiryDate.split("T")[0]
      : "",
    is_active: coupon.isActive,
    max_uses: coupon.usageLimit ?? undefined,
    current_uses: coupon.usedCount ?? 0,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await getAdminCoupons({
        page: 1,
        search: search.trim() || undefined,
      });
      setCoupons((data.coupons || []).map(mapCoupon));
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách coupon");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    setFormData(defaultForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      coupon_type: coupon.coupon_type,
      discount_percent: coupon.discount_percent?.toString() ?? "",
      discount_amount: coupon.discount_amount?.toString() ?? "",
      min_order_amount: coupon.min_order_amount.toString(),
      expiration_date: coupon.expiration_date,
      max_uses: coupon.max_uses?.toString() ?? "",
      is_active: coupon.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa mã giảm giá này?")) return;

    try {
      await deleteCoupon(id);
      toast.success("Đã xóa mã giảm giá");
      loadCoupons();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Không thể xóa coupon");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Vui lòng nhập mã coupon");
      return;
    }

    if (formData.coupon_type === "PERCENT" && !formData.discount_percent) {
      toast.error("Vui lòng nhập phần trăm giảm giá");
      return;
    }

    if (formData.coupon_type === "FIXED" && !formData.discount_amount) {
      toast.error("Vui lòng nhập số tiền giảm giá");
      return;
    }

    const payload: any = {
      code: formData.code.toUpperCase().trim(),
      type: formData.coupon_type,
      value:
        formData.coupon_type === "PERCENT"
          ? Number(formData.discount_percent || 0)
          : formData.coupon_type === "FIXED"
          ? Number(formData.discount_amount || 0)
          : 0,
      min_order_amount: Number(formData.min_order_amount) || 0,
      expires_at: formData.expiration_date || null,
      usage_limit: formData.max_uses ? Number(formData.max_uses) : null,
      is_active: formData.is_active,
    };

    setSaving(true);
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await createCoupon(payload);
        toast.success("Đã tạo mã giảm giá mới");
      }
      loadCoupons();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mã Giảm Giá</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Quản lý các coupon khuyến mãi
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo mã mới
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm mã giảm giá..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          Tổng: <strong className="text-foreground">{coupons.length}</strong>
        </span>
        <span>
          Đang hoạt động:{" "}
          <strong className="text-green-600">
            {coupons.filter((c) => c.is_active).length}
          </strong>
        </span>
        <span>
          Vô hiệu:{" "}
          <strong className="text-red-500">
            {coupons.filter((c) => !c.is_active).length}
          </strong>
        </span>
      </div>

      {/* Coupon grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Không tìm thấy mã nào
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="relative group">
              <CouponCard {...c} />
              {/* Admin action buttons on hover */}
              <div className="absolute top-3 right-3 hidden group-hover:flex gap-1.5 z-10">
                <button
                  onClick={() => handleEdit(c)}
                  className="p-1.5 rounded-lg bg-background/90 backdrop-blur border border-border shadow-sm hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg bg-background/90 backdrop-blur border border-border shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Chỉnh sửa" : "Tạo"} mã giảm giá
            </DialogTitle>
            <DialogDescription>Điền thông tin mã giảm giá</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Mã coupon</Label>
              <Input
                placeholder="VD: SUMMER20"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                required
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <Label>Loại giảm giá</Label>
              <Select
                value={formData.coupon_type}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, coupon_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Giảm theo %</SelectItem>
                  <SelectItem value="FIXED">Giảm số tiền cố định</SelectItem>
                  <SelectItem value="FREE_SHIP">Miễn phí vận chuyển</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.coupon_type === "PERCENT" && (
              <div className="space-y-1">
                <Label>Phần trăm giảm (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="VD: 20"
                  value={formData.discount_percent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_percent: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}

            {formData.coupon_type === "FIXED" && (
              <div className="space-y-1">
                <Label>Số tiền giảm ($)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="VD: 10"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_amount: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Giá trị đơn tối thiểu ($)</Label>
              <Input
                type="number"
                min={0}
                placeholder="0 = không giới hạn"
                value={formData.min_order_amount}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_amount: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Ngày hết hạn</Label>
              <Input
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiration_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Số lần dùng tối đa</Label>
              <Input
                type="number"
                min={1}
                placeholder="Để trống = không giới hạn"
                value={formData.max_uses}
                onChange={(e) =>
                  setFormData({ ...formData, max_uses: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Kích hoạt ngay</Label>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, is_active: !formData.is_active })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.is_active ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    formData.is_active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1">
                {editingCoupon ? "Cập nhật" : "Tạo mã"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
