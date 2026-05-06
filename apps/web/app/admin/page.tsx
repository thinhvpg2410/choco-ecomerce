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
        <div className="flex w-full min-h-screen bg-background">
          {/* ───────── SIDEBAR ───────── */}
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="text-base font-bold px-2 py-3">
                  🍫 Admin Panel
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveSection(item.id)}
                          isActive={activeSection === item.id}
                          className="cursor-pointer"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* FOOTER */}
            <SidebarFooter className="p-3 border-t">
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </SidebarMenuButton>
            </SidebarFooter>
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
