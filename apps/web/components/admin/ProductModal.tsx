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
import { toast } from "sonner";
import { X, Camera, Package } from "lucide-react";

import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/services/admin.product.service";

import { productImageService } from "@/services/product-image.service";
import { sl } from "zod/v4/locales";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editing?: any | null;
  categories: any[];
  brands: any[];
};

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
    slug:"",
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

  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);

  // Ảnh phụ
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
    }
    setSelectedMainImage(null);
    setAdditionalImages([]);
  }, [editing]);

  const loadAdditionalImages = async (productId: string) => {
    try {
      const data = await productImageService.getProductImages(productId);
      setExistingAdditionalImages(
        Array.isArray(data) ? data : data?.data || [],
      );
    } catch (err) {
      console.error(err);
    }
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

  const removeNewImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
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

    if (!form.description || !form.package_type || !form.weight_unit) {
      toast.error("Thiếu thông tin sản phẩm");
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

      // Upload ảnh đại diện
      if (selectedMainImage && productId) {
        const fd = new FormData();
        fd.append("file", selectedMainImage);
        const res = await uploadProductImage(productId, fd);
        const newUrl = res?.image_url || res?.url;
        if (newUrl) await updateProduct(productId, { image_url: newUrl });
      }

      // Upload ảnh phụ
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* 1. Ảnh đại diện */}
          <div>
            <Label className="text-lg font-medium mb-3 block">
              Ảnh đại diện
            </Label>
            <div className="flex gap-6 items-start">
              <div className="w-56 h-56 border-2 border-dashed rounded-2xl overflow-hidden bg-gray-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-20 h-20" />
                  </div>
                )}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageSelect}
                />
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG, WebP • Tối đa 5MB
                </p>
              </div>
            </div>
          </div>

          {/* 2. Ảnh phụ */}
          <div>
            <Label className="text-lg font-medium mb-3 block">
              Ảnh phụ (Multiple)
            </Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalSelect}
            />

            {additionalImages.length > 0 && (
              <div className="mt-4 grid grid-cols-6 gap-3">
                {additionalImages.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {existingAdditionalImages.length > 0 && (
              <div className="mt-6">
                <p className="font-medium mb-3">
                  Ảnh đã tải lên ({existingAdditionalImages.length})
                </p>
                <div className="grid grid-cols-6 gap-3">
                  {existingAdditionalImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.imageUrl}
                        //src={img.image_url}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Thông tin chính */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setForm({
                    ...form,
                    name: newName,
                    slug: generateSlug(newName),
                  });
                }}
                placeholder="Ví dụ: Socola KitKat 5 thanh"
              />
              
            </div>

            <div>
              <Label>
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>

            <div>
              <Label>
                Giá gốc (VND) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label>Giá khuyến mãi (VND)</Label>
              <Input
                type="number"
                value={form.sale_price || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sale_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label>Giá vốn</Label>
              <Input
                type="number"
                value={form.cost_price || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cost_price: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label>
                Tồn kho <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label>
                Danh mục <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger>
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

            <div>
              <Label>
                Thương hiệu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.brand_id}
                onValueChange={(v) => setForm({ ...form, brand_id: v })}
              >
                <SelectTrigger>
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
          </div>

          {/* Mô tả */}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <Label>Mô tả ngắn</Label>
              <Textarea
                value={form.short_description}
                onChange={(e) =>
                  setForm({ ...form, short_description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div>
              <Label>Mô tả chi tiết</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={5}
              />
            </div>
          </div>

          {/* Thông tin khác */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Xuất xứ</Label>
              <Input
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Trọng lượng</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) =>
                    setForm({ ...form, weight: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Đơn vị</Label>
                <Select
                  value={form.weight_unit}
                  onValueChange={(v) => setForm({ ...form, weight_unit: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">gram (g)</SelectItem>
                    <SelectItem value="kg">kilogram (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Loại bao bì</Label>
              <Input
                value={form.package_type}
                onChange={(e) =>
                  setForm({ ...form, package_type: e.target.value })
                }
                placeholder="Hộp, túi, lon..."
              />
            </div>

            <div className="md:col-span-2">
              <Label>Thành phần</Label>
              <Textarea
                value={form.ingredients}
                onChange={(e) =>
                  setForm({ ...form, ingredients: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <Label className="text-base font-medium mb-4 block">
              Trạng thái
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Hoạt động</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
                <Label>Nổi bật</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_best_seller}
                  onCheckedChange={(v) =>
                    setForm({ ...form, is_best_seller: v })
                  }
                />
                <Label>Best Seller</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_new}
                  onCheckedChange={(v) => setForm({ ...form, is_new: v })}
                />
                <Label>Sản phẩm mới</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm sản phẩm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
