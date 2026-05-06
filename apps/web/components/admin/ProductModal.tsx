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
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/services/admin.product.service";
import ImageUpload from "@/components/upload/ImageUpload";
import { Camera, Package, Tag } from "lucide-react";

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
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: 0,
    sale_price: null as number | null,
    cost_price: null as number | null,
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      const newForm = {
        name: editing.name || "",
        sku: editing.sku || "",
        price: Number(editing.price) || 0,
        sale_price: editing.sale_price ? Number(editing.sale_price) : null,
        cost_price: editing.cost_price ? Number(editing.cost_price) : null,
        stock: Number(editing.stock) || 0,
        image_url: editing.image_url || "",
        short_description: editing.short_description || "",
        description: editing.description || "",
        category_id: editing.category_id || "",
        brand_id: editing.brand_id || "",
        ingredients: editing.ingredients || "",
        origin: editing.origin || "",
        weight: Number(editing.weight) || 0,
        weight_unit: editing.weight_unit || "g",
        package_type: editing.package_type || "",
        is_active: editing.is_active ?? true,
        is_featured: editing.is_featured ?? false,
        is_best_seller: editing.is_best_seller ?? false,
        is_new: editing.is_new ?? false,
      };
      setForm(newForm);
      setImagePreview(editing.image_url || "");
      setSelectedImageFile(null);
    } else {
      setForm({
        name: "",
        sku: "",
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
      setSelectedImageFile(null);
    }
  }, [editing]);

  const handleImageSelect = (file: File) => {
    setSelectedImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const uploadImageIfNeeded = async (productId: string) => {
    if (!selectedImageFile) return undefined;

    const formData = new FormData();
    formData.append("file", selectedImageFile);

    const uploadedProduct = await uploadProductImage(productId, formData);
    const imageUrl =
      uploadedProduct?.image_url ||
      uploadedProduct?.imageUrl ||
      uploadedProduct?.url;

    if (imageUrl) {
      setForm((prev) => ({ ...prev, image_url: imageUrl }));
      setImagePreview(imageUrl);
    }

    return imageUrl;
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

    setIsSaving(true);
    try {
      const payload = { ...form };

      if (editing) {
        if (selectedImageFile) {
          const imageUrl = await uploadImageIfNeeded(editing.id);
          if (imageUrl) {
            payload.image_url = imageUrl;
          }
        }
        await updateProduct(editing.id, payload);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        const createdProduct = await createProduct(payload);
        if (selectedImageFile && createdProduct?.id) {
          const imageUrl = await uploadImageIfNeeded(createdProduct.id);
          if (imageUrl) {
            await updateProduct(createdProduct.id, { image_url: imageUrl });
          }
        }
        toast.success("Thêm sản phẩm mới thành công");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi lưu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold">
            {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* ==================== PHẦN ẢNH ==================== */}
          <div>
            <Label className="text-base font-medium flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5" /> Ảnh sản phẩm chính
            </Label>
            <div className="flex gap-6 items-start">
              <div className="w-48 h-48 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Package className="w-12 h-12 mb-2" />
                    <p className="text-sm">Chưa có ảnh</p>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  currentImageUrl={imagePreview}
                  label="Click hoặc kéo thả ảnh vào đây"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Định dạng hỗ trợ: JPG, PNG, WebP • Tối đa 5MB
                </p>
              </div>
            </div>
          </div>

          {/* ==================== THÔNG TIN CHÍNH ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label>
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-lg"
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

            {/* Danh mục & Brand */}
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

          {/* ==================== MÔ TẢ ==================== */}
          <div className="space-y-4">
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

          {/* ==================== THÔNG TIN ĐẶC THÙ ==================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-6">
            <div>
              <Label>Xuất xứ</Label>
              <Input
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Việt Nam, Nhật Bản..."
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
                placeholder="Hộp, Túi, Lon, Hũ..."
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

          {/* ==================== TRẠNG THÁI ==================== */}
          <div className="border-t pt-6">
            <Label className="text-base font-medium mb-4 block">
              Trạng thái hiển thị
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} className="px-6" disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="px-8" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm sản phẩm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
