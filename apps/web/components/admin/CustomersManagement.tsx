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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Search, ShieldCheck, User2, Loader2, Users, Lock } from "lucide-react";
import { getAdminUsers, toggleUserStatus } from "@/services/admin.service";
import type { User } from "@/types/type";

function UserTable({
  users,
  loading,
  actionLoading,
  onToggle,
  showToggle = true,
}: {
  users: User[];
  loading: boolean;
  actionLoading: string | null;
  onToggle: (id: string, status: string) => void;
  showToggle?: boolean;
}) {
  const getInitials = (user: User) => {
    const name = user.username || user.email || "";
    return name.slice(0, 2).toUpperCase();
  };

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

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <User2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có tài khoản nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold">Người dùng</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Điện thoại</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày tạo</TableHead>
            {showToggle && (
              <TableHead className="text-right font-semibold">
                Hành động
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const avatarUrl = user.avatarUrl || (user as any).avatar_url;
            return (
              <TableRow
                key={user.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted flex-shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user.username || ""}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center font-semibold text-indigo-700 text-sm">
                          {getInitials(user)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {user.username || "Không tên"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {user.id?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm">{user.email}</TableCell>
                <TableCell className="text-sm">{user.phone || "—"}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      user.status === "active" ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {user.status === "active" ? "Hoạt động" : "Vô hiệu"}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(user.createdAt || (user as any).created_at)}
                </TableCell>

                {showToggle && (
                  <TableCell className="text-right">
                    <Button
                      variant={user.status === "active" ? "outline" : "default"}
                      size="sm"
                      disabled={actionLoading === user.id}
                      onClick={() => onToggle(user.id, user.status)}
                      className="text-xs h-7 px-3"
                    >
                      {actionLoading === user.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : user.status === "active" ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Khóa
                        </>
                      ) : (
                        "Mở khóa"
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function CustomersManagement() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
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
      setAllUsers(res.users || []);
    } catch (err) {
      toast.error("Không thể tải danh sách tài khoản");
      setAllUsers([]);
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
      setAllUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus as any } : user,
        ),
      );
      toast.success(
        newStatus === "active" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không thể thay đổi trạng thái",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const normalUsers = allUsers.filter((u) => u.role !== "admin");
  const adminUsers = allUsers.filter((u) => u.role === "admin");
  const activeCount = normalUsers.filter((u) => u.status === "active").length;
  const lockedCount = normalUsers.filter((u) => u.status !== "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý tài khoản</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Quản lý khách hàng và tài khoản admin trong hệ thống
        </p>
      </div>

      {/* Stats — chỉ cho user thường */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng khách hàng</p>
              <p className="text-2xl font-bold">{normalUsers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <User2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bị khóa</p>
              <p className="text-2xl font-bold text-red-600">{lockedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="mb-4 h-9">
          <TabsTrigger value="users" className="gap-2 text-sm">
            <User2 className="h-3.5 w-3.5" />
            Khách hàng
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {normalUsers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-2 text-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Quản trị viên
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {adminUsers.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-0">
              <UserTable
                users={normalUsers}
                loading={loading}
                actionLoading={actionLoading}
                onToggle={handleToggleStatus}
                showToggle={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b bg-amber-50/60 dark:bg-amber-950/20">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tài khoản admin không thể bị vô hiệu hóa qua giao diện này
                </p>
              </div>
              <UserTable
                users={adminUsers}
                loading={loading}
                actionLoading={actionLoading}
                onToggle={() => {}}
                showToggle={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
