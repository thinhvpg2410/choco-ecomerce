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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductModal from "@/components/admin/ProductModal";
import {
  getAdminProducts,
  toggleProductActive
} from "@/services/admin.product.service";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Package,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
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
  const [totalItems, setTotalItems] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [statusFilter, setStatusFilter] = useState<"" | "active" | "hidden">(
    "",
  );

  const [activeCount, setActiveCount] = useState(0);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands"),
        ]);
        const catData =
          catRes.data?.data?.items ?? catRes.data?.data ?? catRes.data ?? [];
        setCategories(catData);
        const brandData = Array.isArray(brandRes.data)
          ? brandRes.data
          : (brandRes.data?.data?.items ??
            brandRes.data?.data ??
            brandRes.data ??
            []);
        setBrands(brandData);
      } catch {
        toast.error("Không load được danh mục/thương hiệu");
      }
    };
    loadFilters();
  }, []);

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
      // trong loadProducts sau setProducts:
      setActiveCount(res.activeCount);
      setHiddenCount(res.hiddenCount);
      setOutOfStockCount(res.outOfStockCount);
      setTotalPages(res.pagination?.totalPages ?? 1);
      setTotalItems(res.pagination?.total ?? res.products?.length ?? 0);
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

  const filteredProducts = products.filter((p) => {
    if (statusFilter === "active") return p.is_active;
    if (statusFilter === "hidden") return !p.is_active;
    return true;
  });

  const handleToggleActive = async (product: any) => {
    const willHide = product.is_active;
    if (
      !confirm(
        willHide
          ? "Xác nhận ẩn sản phẩm này?"
          : "Xác nhận bật hiển thị sản phẩm này?",
      )
    )
      return;

    try {
      const updated = await toggleProductActive(product.id);

      // Cập nhật trạng thái sản phẩm trong list
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: updated.is_active } : p,
        ),
      );

      // Cập nhật counts ngay, không cần gọi lại API
      setActiveCount((c) => c + (willHide ? -1 : 1));
      setHiddenCount((c) => c + (willHide ? 1 : -1));

      toast.success(
        updated.is_active ? "Đã bật hiển thị sản phẩm" : "Đã ẩn sản phẩm",
      );
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const stockBadge = (stock: number) => {
    if (stock === 0)
      return {
        label: "Hết hàng",
        variant: "destructive" as const,
        dot: "bg-red-500",
      };
    if (stock <= 10)
      return {
        label: `Sắp hết (${stock})`,
        variant: "outline" as const,
        dot: "bg-amber-400",
      };
    return {
      label: `${stock} còn`,
      variant: "secondary" as const,
      dot: "bg-green-500",
    };
  };

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sản phẩm</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalItems} sản phẩm trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpenModal(true);
          }}
          className="gap-2 h-9 px-4"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Tổng sản phẩm",
            value: totalItems,
            color: "text-foreground",
          },
          {
            label: "Đang bán",
            value: activeCount,
            color: "text-green-600",
          },
          {
            label: "Hết hàng",
            value: outOfStockCount,
            color: "text-red-500",
          },
          {
            label: "Đã ẩn",
            value: hiddenCount,
            color: "text-muted-foreground",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 bg-muted/40">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm tên, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                className="pl-9 h-8 text-sm bg-background"
              />
            </div>

            <select
              className="h-8 text-sm border rounded-md px-3 bg-background text-foreground min-w-[130px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="hidden">Đã ẩn</option>
            </select>

            <select
              className="h-8 text-sm border rounded-md px-3 bg-background text-foreground min-w-[140px]"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="h-8 text-sm border rounded-md px-3 bg-background text-foreground min-w-[140px]"
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="secondary"
              onClick={loadProducts}
              className="h-8 gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <Package className="h-8 w-8 animate-pulse opacity-40" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : filteredProducts.length === 0  ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <Package className="h-10 w-10 opacity-20" />
              <p className="text-sm">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold w-[300px]">
                    Sản phẩm
                  </TableHead>
                  <TableHead className="font-semibold">Giá bán</TableHead>
                  <TableHead className="font-semibold">Tồn kho</TableHead>
                  <TableHead className="font-semibold">Nhãn</TableHead>
                  <TableHead className="font-semibold">Hiển thị</TableHead>
                  <TableHead className="text-right font-semibold">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProducts.map((p) => {
                  const stock = stockBadge(p.stock);
                  const displayPrice = p.sale_price || p.price;
                  const hasDiscount = p.sale_price && p.sale_price < p.price;

                  return (
                    <TableRow
                      key={p.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      {/* Product */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 flex-shrink-0">
                            <img
                              src={p.image_url || "/image/fallback.png"}
                              className="w-full h-full rounded-lg object-cover border border-border"
                              alt={p.name}
                            />
                            {p._count?.productImages > 0 && (
                              <span className="absolute -bottom-1 -right-1 text-[10px] bg-muted border rounded px-1 leading-4">
                                +{p._count.productImages}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm line-clamp-1 leading-tight">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              SKU: {p.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">
                            {formatVND(Number(displayPrice))}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatVND(Number(p.price))}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Stock */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${stock.dot}`}
                          />
                          <Badge variant={stock.variant} className="text-xs">
                            {stock.label}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Labels */}
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {p.is_featured && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5" /> Nổi bật
                            </span>
                          )}
                          {p.is_best_seller && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" /> Top
                            </span>
                          )}
                          {p.is_new && (
                            <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Mới
                            </span>
                          )}
                          {!p.is_featured && !p.is_best_seller && !p.is_new && (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={p.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {p.is_active ? "Đang bán" : "Đã ẩn"}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
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
                            className={`h-7 w-7 p-0 transition-colors ${
                              p.is_active
                                ? "hover:bg-red-50 hover:border-red-200"
                                : "hover:bg-green-50 hover:border-green-200"
                            }`}
                            title={p.is_active ? "Ẩn sản phẩm" : "Bật hiển thị"}
                            onClick={() => handleToggleActive(p)}
                          >
                            {p.is_active ? (
                              <EyeOff className="w-3 h-3 text-red-500" />
                            ) : (
                              <Eye className="w-3 h-3 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? "default" : "outline"}
                  onClick={() => setPage(p)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {p}
                </Button>
              );
            })}
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
