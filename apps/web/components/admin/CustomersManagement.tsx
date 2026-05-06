"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Search, ShieldCheck, User2, Loader2 } from "lucide-react";
import { getAdminUsers, toggleUserStatus } from "@/services/admin.service";
import type { User } from "@/types/type";

export function CustomersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        page: 1,
        search: search.trim() || undefined,
      });

      console.log("✅ Full users data:", res);
      setUsers(res.users || []);
    } catch (err) {
      console.error("❌ Load users error:", err);
      toast.error("Không thể tải danh sách khách hàng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    if (actionLoading) return;

    setActionLoading(userId);
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await toggleUserStatus(userId, newStatus);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus as any } : user,
        ),
      );

      toast.success(
        newStatus === "active"
          ? "Đã kích hoạt tài khoản"
          : "Đã vô hiệu hóa tài khoản",
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không thể thay đổi trạng thái",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (user: User) => {
    const name = user.username || user.email || "";
    return name.slice(0, 2).toUpperCase();
  };

  // Format ngày an toàn
  const formatDate = (dateString?: string | null | Date) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Khách Hàng</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {users.length} tài khoản
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng số</p>
            <p className="text-3xl font-bold mt-1">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Hoạt động</p>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {users.filter((u) => u.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bị khóa</p>
            <p className="text-3xl font-bold mt-1 text-red-600">
              {users.filter((u) => u.status !== "active").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-16 text-muted-foreground"
                      >
                        Chưa có khách hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const avatarUrl =
                        user.avatarUrl || (user as any).avatar_url;

                      return (
                        <TableRow key={user.id}>
                          {/* Avatar + Name */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={user.username || ""}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center font-semibold text-indigo-700 text-sm">
                                    {getInitials(user)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {user.username || "Không tên"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="font-mono text-sm">
                            {user.email}
                          </TableCell>
                          <TableCell>{user.phone || "—"}</TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : "secondary"
                              }
                            >
                              {user.role === "admin" ? (
                                <ShieldCheck className="inline w-3.5 h-3.5 mr-1" />
                              ) : (
                                <User2 className="inline w-3.5 h-3.5 mr-1" />
                              )}
                              {user.role === "admin" ? "Admin" : "User"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {user.status === "active"
                                ? "Hoạt động"
                                : "Vô hiệu"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(
                              user.createdAt || (user as any).created_at,
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === user.id}
                              onClick={() =>
                                handleToggleStatus(user.id, user.status)
                              }
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.status === "active" ? (
                                "Vô hiệu hóa"
                              ) : (
                                "Kích hoạt"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
