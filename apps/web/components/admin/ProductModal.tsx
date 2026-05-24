"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  X,
  Package,
  Loader2,
  Info,
  Star,
  TrendingUp,
  Eye,
  Sparkles,
  Tag,
  DollarSign,
} from "lucide-react";

import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/services/admin.product.service";
import { productImageService } from "@/services/product-image.service";

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editing?: any | null;
  categories: any[];
  brands: any[];
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductModal({
  open,
  onClose,
  onSuccess,
  editing,
  categories = [],
  brands = [],
}: Props) {
  const [form, setForm] = useState<any>({
    name: "",
    sku: "",
    slug: "",
    // Giá bán = giá niêm yết / giá khách trả (price)
    price: 0,
    // Giá khuyến mãi = giá sau khi giảm (sale_price)
    sale_price: null,
    // Giá vốn = giá nhập hàng (cost_price)
    cost_price: null,
    stock: 0,
    image_url: "",
    short_description: "",
    description: "",
    category_id: "",
    brand_id: "",
    ingredients: "",
    origin: "",
    weight: 0,
    weight_unit: "g",
    package_type: "",
    is_active: true,
    is_featured: false,
    is_best_seller: false,
    is_new: false,
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<
    any[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return `${slug}-${Date.now()}`;
  };

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || "",
        sku: editing.sku || "",
        slug: editing.slug || "",
        price: Number(editing.price) || 0,
        sale_price: editing.sale_price ? Number(editing.sale_price) : null,
        cost_price: editing.cost_price ? Number(editing.cost_price) : null,
        stock: Number(editing.stock) || 0,
        image_url: editing.image_url || "",
        short_description: editing.short_description || "",
        description: editing.description || "",
        category_id: editing.category?.id || editing.category_id || "",
        brand_id: editing.brand?.id || editing.brand_id || "",
        ingredients: editing.ingredients || "",
        origin: editing.origin || "",
        weight: Number(editing.weight) || 0,
        weight_unit: editing.weight_unit || "g",
        package_type: editing.package_type || "",
        is_active: editing.is_active ?? true,
        is_featured: editing.is_featured ?? false,
        is_best_seller: editing.is_best_seller ?? false,
        is_new: editing.is_new ?? false,
      });
      setImagePreview(editing.image_url || "");
      loadAdditionalImages(editing.id);
    } else {
      resetForm();
    }
    setSelectedMainImage(null);
    setAdditionalImages([]);
  }, [editing]);

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      slug: "",
      price: 0,
      sale_price: null,
      cost_price: null,
      stock: 0,
      image_url: "",
      short_description: "",
      description: "",
      category_id: "",
      brand_id: "",
      ingredients: "",
      origin: "",
      weight: 0,
      weight_unit: "g",
      package_type: "",
      is_active: true,
      is_featured: false,
      is_best_seller: false,
      is_new: false,
    });
    setImagePreview("");
    setExistingAdditionalImages([]);
  };

  const loadAdditionalImages = async (productId: string) => {
    try {
      const data = await productImageService.getProductImages(productId);
      setExistingAdditionalImages(
        Array.isArray(data) ? data : data?.data || [],
      );
    } catch {}
  };

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMainImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeExistingImage = async (id: string) => {
    if (!confirm("Xóa ảnh này?")) return;
    try {
      await productImageService.deleteImage(id);
      setExistingAdditionalImages((prev) =>
        prev.filter((img) => img.id !== id),
      );
      toast.success("Đã xóa ảnh");
    } catch {
      toast.error("Không thể xóa ảnh");
    }
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.sku ||
      !form.category_id ||
      !form.brand_id ||
      form.price <= 0
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc (*)");
      return;
    }
    if (!form.slug) {
      toast.error("Slug không được để trống");
      return;
    }

    setIsSaving(true);
    try {
      let productId = editing?.id;
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        const created = await createProduct(form);
        productId = created?.id || created?.data?.id;
      }

      if (selectedMainImage && productId) {
        const fd = new FormData();
        fd.append("file", selectedMainImage);
        const res = await uploadProductImage(productId, fd);
        const newUrl = res?.image_url || res?.url;
        if (newUrl) await updateProduct(productId, { image_url: newUrl });
      }

      if (additionalImages.length > 0 && productId) {
        for (let i = 0; i < additionalImages.length; i++) {
          await productImageService.uploadImage(
            additionalImages[i],
            productId,
            i,
          );
        }
      }

      toast.success(
        editing ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!",
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lưu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // Tính % giảm giá
  const discountPercent =
    form.sale_price && form.price > 0
      ? Math.round(((form.price - form.sale_price) / form.price) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Dialog header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <DialogTitle className="text-lg font-bold">
            {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* ── SECTION 1: Ảnh ── */}
          <Section title="Hình ảnh sản phẩm" icon={Package}>
            <div className="flex gap-5 items-start">
              <div className="w-32 h-32 border-2 border-dashed rounded-xl overflow-hidden bg-muted/40 flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                    <Package className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Label className="text-sm">Ảnh đại diện</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageSelect}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP – tối đa 5MB
                </p>

                <div className="pt-2">
                  <Label className="text-sm">Ảnh phụ (nhiều ảnh)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalSelect}
                    className="h-8 text-sm mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview grids */}
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-6 gap-2 mt-2">
                {additionalImages.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() =>
                        setAdditionalImages((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {existingAdditionalImages.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Ảnh đã tải lên ({existingAdditionalImages.length})
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {existingAdditionalImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.imageUrl}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Separator />

          {/* ── SECTION 2: Thông tin cơ bản ── */}
          <Section title="Thông tin cơ bản" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <Label className="text-sm">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, name: v, slug: generateSlug(v) });
                  }}
                  placeholder="Ví dụ: Socola KitKat 5 thanh 100g"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">
                  SKU <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs text-muted-foreground font-normal">
                    (mã kho nội bộ)
                  </span>
                </Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="KIT-001"
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">
                  Thương hiệu <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.brand_id}
                  onValueChange={(v) => setForm({ ...form, brand_id: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">
                  Tồn kho <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                  className="h-9"
                  min={0}
                />
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── SECTION 3: Giá ── */}
          <Section title="Giá bán" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Giá bán */}
              <div className="space-y-1">
                <Label className="text-sm">
                  Giá bán <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Giá niêm yết hiển thị trên sản phẩm
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    className="h-9 pr-10"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ₫
                  </span>
                </div>
              </div>

              {/* Giá khuyến mãi */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Giá khuyến mãi</Label>
                  {discountPercent !== null && discountPercent > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] h-4 px-1.5"
                    >
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Giá thực tế khách trả (để trống nếu không giảm)
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.sale_price || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sale_price: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="h-9 pr-10"
                    placeholder="Không bắt buộc"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ₫
                  </span>
                </div>
              </div>

              {/* Giá vốn */}
              <div className="space-y-1">
                <Label className="text-sm">Giá vốn / Giá nhập</Label>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Giá bạn nhập hàng (chỉ admin thấy)
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.cost_price || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cost_price: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="h-9 pr-10"
                    placeholder="Không bắt buộc"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ₫
                  </span>
                </div>
              </div>
            </div>

            {/* Price summary */}
            {form.price > 0 && (
              <div className="mt-2 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground grid grid-cols-3 gap-2">
                <span>
                  Giá bán:{" "}
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat("vi-VN").format(form.price)}đ
                  </span>
                </span>
                {form.sale_price && (
                  <span>
                    Giá KM:{" "}
                    <span className="font-medium text-red-600">
                      {new Intl.NumberFormat("vi-VN").format(form.sale_price)}đ
                    </span>
                    {discountPercent &&
                      discountPercent > 0 &&
                      ` (−${discountPercent}%)`}
                  </span>
                )}
                {form.cost_price && (
                  <span>
                    Lợi nhuận ≈{" "}
                    <span className="font-medium text-green-600">
                      {new Intl.NumberFormat("vi-VN").format(
                        (form.sale_price || form.price) - form.cost_price,
                      )}
                      đ
                    </span>
                  </span>
                )}
              </div>
            )}
          </Section>

          <Separator />

          {/* ── SECTION 4: Mô tả ── */}
          <Section title="Mô tả sản phẩm" icon={Tag}>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm">Mô tả ngắn</Label>
                <Textarea
                  value={form.short_description}
                  onChange={(e) =>
                    setForm({ ...form, short_description: e.target.value })
                  }
                  rows={2}
                  placeholder="Một câu tóm tắt sản phẩm (hiển thị trên trang danh sách)"
                  className="text-sm resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Mô tả chi tiết</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={5}
                  placeholder="Mô tả đầy đủ về sản phẩm, công dụng, hướng dẫn sử dụng..."
                  className="text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Thành phần</Label>
                <Textarea
                  value={form.ingredients}
                  onChange={(e) =>
                    setForm({ ...form, ingredients: e.target.value })
                  }
                  rows={3}
                  placeholder="Liệt kê thành phần (mỗi thành phần một dòng)"
                  className="text-sm"
                />
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── SECTION 5: Thông tin kỹ thuật ── */}
          <Section title="Thông tin kỹ thuật" icon={Package}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm">Xuất xứ</Label>
                <Input
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  placeholder="Việt Nam, Nhật Bản, Hàn Quốc..."
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Loại bao bì</Label>
                <Input
                  value={form.package_type}
                  onChange={(e) =>
                    setForm({ ...form, package_type: e.target.value })
                  }
                  placeholder="Hộp giấy, túi zip, lon thiếc..."
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">Trọng lượng</Label>
                  <Input
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: Number(e.target.value) })
                    }
                    className="h-9"
                    min={0}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Đơn vị</Label>
                  <Select
                    value={form.weight_unit}
                    onValueChange={(v) => setForm({ ...form, weight_unit: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">gram (g)</SelectItem>
                      <SelectItem value="kg">kilogram (kg)</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="l">lít (l)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Section>

          <Separator />

          {/* ── SECTION 6: Trạng thái & nhãn ── */}
          <Section title="Trạng thái & nhãn" icon={Star}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  key: "is_active",
                  label: "Đang bán",
                  sub: "Hiển thị trên cửa hàng",
                  icon: Eye,
                  color: "text-green-600",
                },
                {
                  key: "is_featured",
                  label: "Nổi bật",
                  sub: "Hiển thị banner trang chủ",
                  icon: Star,
                  color: "text-amber-500",
                },
                {
                  key: "is_best_seller",
                  label: "Bán chạy",
                  sub: "Gắn nhãn Best Seller",
                  icon: TrendingUp,
                  color: "text-blue-600",
                },
                {
                  key: "is_new",
                  label: "Hàng mới",
                  sub: "Gắn nhãn New",
                  icon: Sparkles,
                  color: "text-violet-600",
                },
              ].map(({ key, label, sub, icon: Icon, color }) => (
                <div
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer select-none ${
                    form[key]
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/20 hover:bg-muted/40"
                  }`}
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                >
                  <Switch
                    checked={form[key]}
                    onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5"
                  />
                  <div>
                    <p
                      className={`text-sm font-medium flex items-center gap-1 ${form[key] ? color : ""}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="h-9"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-9 px-5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : editing ? (
              "Lưu thay đổi"
            ) : (
              "Thêm sản phẩm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
