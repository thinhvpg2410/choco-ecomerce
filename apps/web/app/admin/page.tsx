"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import AdminProtectedRoute from "@/components/AdminProtectedRoute";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Overview } from "@/components/admin/Overview";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { CustomersManagement } from "@/components/admin/CustomersManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { CouponsManagement } from "@/components/admin/CouponsManagement";
import { Statistics } from "@/components/admin/Statistics";

import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Home,
  Package,
  Users,
  ShoppingCart,
  Ticket,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { logout } from "@/store/authSlice";
import { authLogout } from "@/services/auth.service";
import { toast, Toaster } from "sonner";

const menuItems = [
  { id: "overview", label: "Tổng quan", icon: Home, component: Overview },
  {
    id: "products",
    label: "Sản phẩm",
    icon: Package,
    component: ProductsManagement,
  },
  {
    id: "customers",
    label: "Khách hàng",
    icon: Users,
    component: CustomersManagement,
  },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: ShoppingCart,
    component: OrdersManagement,
  },
  {
    id: "coupons",
    label: "Mã giảm giá",
    icon: Ticket,
    component: CouponsManagement,
  },
  {
    id: "statistics",
    label: "Thống kê",
    icon: BarChart3,
    component: Statistics,
  },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const router = useRouter();
  const dispatch = useDispatch();

  const ActiveComponent =
    menuItems.find((item) => item.id === activeSection)?.component ?? Overview;

  const handleLogout = async () => {
    try {
      await authLogout();
      dispatch(logout());
      toast.success("Đã đăng xuất thành công");
      router.replace("/");
    } catch {
      toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <AdminProtectedRoute>
      <SidebarProvider>
        {/* MAIN WRAPPER - QUAN TRỌNG */}
        <div className="flex w-full h-screen overflow-hidden bg-background">
          <Sidebar
            variant="sidebar"
            collapsible="icon"
            className="h-screen border-r bg-background"
          >
            <div className="flex flex-col h-full">
              {/* LOGO */}
              <div className="px-4 py-5 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col leading-tight">
                    <span className="font-bold text-[15px]">Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Quản lý Choco Kingdom
                    </span>
                  </div>
                </div>
              </div>

              {/* MENU */}
              <div className="flex-1 overflow-y-auto py-3">
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <SidebarMenu className="space-y-1 px-2">
                        {menuItems.map((item) => (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                              onClick={() => setActiveSection(item.id)}
                              isActive={activeSection === item.id}
                              className="
                                h-11 rounded-xl cursor-pointer
                                transition-all
                                hover:bg-muted
                                data-[active=true]:bg-primary
                                data-[active=true]:text-primary-foreground
                              "
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="font-medium">{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
              </div>

              {/* LOGOUT BOTTOM */}
              <div className="p-3 border-t">
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="
                    h-11 w-full rounded-xl
                    text-red-600
                    hover:bg-red-50
                    hover:text-red-700
                  "
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </SidebarMenuButton>
              </div>
            </div>
          </Sidebar>
          {/* ───────── CONTENT ───────── */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* HEADER */}
            <header className="border-b px-6 py-4 bg-background sticky top-0 z-10">
              <h1 className="text-xl font-bold">
                {menuItems.find((i) => i.id === activeSection)?.label}
              </h1>
            </header>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
              <div className="max-w-screen-xl mx-auto">
                <ActiveComponent />
              </div>
            </div>
          </main>
        </div>

        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </AdminProtectedRoute>
  );
}
