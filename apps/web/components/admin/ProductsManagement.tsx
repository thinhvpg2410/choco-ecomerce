"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductModal from "@/components/admin/ProductModal";
import {
  getAdminProducts,
  deleteProduct,
} from "@/services/admin.product.service";

import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, Star, Sparkles } from "lucide-react";

import api from "@/services/axios";

export function ProductsManagement() {
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // LOAD FILTER DATA
  // LOAD FILTER DATA
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands"),
        ]);

        // Categories (có { data: [...] })
        const catData =
          catRes.data?.data?.items ?? catRes.data?.data ?? catRes.data ?? [];
        setCategories(catData);

        // Brands (trả về trực tiếp array)
        const brandData = Array.isArray(brandRes.data)
          ? brandRes.data
          : (brandRes.data?.data?.items ??
            brandRes.data?.data ??
            brandRes.data ??
            []);
        setBrands(brandData);

        console.log("✅ Loaded brands:", brandData.length);
      } catch (err) {
        console.error("Load filter error", err);
        toast.error("Không load được danh mục/thương hiệu");
      }
    };

    loadFilters();
  }, []);

  // LOAD PRODUCTS
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        page,
        search,
        category_id: categoryId || undefined,
        brand_id: brandId || undefined,
      });

      setProducts(res.products ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch {
      toast.error("Không load được sản phẩm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, categoryId, brandId]);

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Xoá sản phẩm?")) return;

    await deleteProduct(id);
    toast.success("Đã xoá");

    loadProducts();
  };

  const stockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Hết hàng", variant: "destructive" as const };
    if (stock <= 10)
      return { label: `Sắp hết (${stock})`, variant: "outline" as const };
    return { label: `Còn hàng (${stock})`, variant: "secondary" as const };
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sản Phẩm</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} sản phẩm
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setOpenModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <Input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <select
          className="border px-3 rounded"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Tất cả category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border px-3 rounded"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
        >
          <option value="">Tất cả brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <Button onClick={() => loadProducts()}>Lọc</Button>
      </div>

      {/* TABLE (GIỮ UI ĐẸP) */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((p) => {
                  const stock = stockStatus(p.stock);

                  return (
                    <TableRow key={p.id}>
                      {/* PRODUCT */}
                      <TableCell className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <img
                            src={p.image_url || "/image/fallback.png"}
                            className="w-10 h-10 rounded object-cover border"
                            alt={p.name}
                          />
                          {p._count?.productImages > 0 && (
                            <div className="text-xs bg-muted px-1.5 rounded flex items-center">
                              +{p._count.productImages}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.sku}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>{p.sku}</TableCell>
                      <TableCell>
                        {Number(p.price).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </TableCell>

                      <TableCell>
                        <Badge variant={stock.variant}>{stock.label}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant={p.is_active ? "default" : "secondary"}>
                          {p.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </TableCell>

                      {/* ACTION */}
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(p);
                            setOpenModal(true);
                          }}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* PAGINATION (GIỐNG PRODUCT PAGE) */}
      <div className="flex justify-center gap-2">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Trước
        </Button>

        <span className="px-3 py-2">
          {page} / {totalPages}
        </span>

        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Sau →
        </Button>
      </div>

      <ProductModal
        open={openModal}
        editing={editing}
        onClose={() => setOpenModal(false)}
        onSuccess={loadProducts}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
