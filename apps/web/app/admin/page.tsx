"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { SidebarProvider } from "@/components/ui/sidebar";

import { Overview } from "@/components/admin/Overview";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { CustomersManagement } from "@/components/admin/CustomersManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { CouponsManagement } from "@/components/admin/CouponsManagement";
import { Statistics } from "@/components/admin/Statistics";

import {
  BarChart3,
  Home,
  Package,
  Users,
  ShoppingCart,
  Ticket,
  LogOut,
  ShieldCheck,
  ChevronRight,
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
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const ActiveComponent =
    menuItems.find((item) => item.id === activeSection)?.component ?? Overview;
  const activeItem = menuItems.find((i) => i.id === activeSection);

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
    <>
      <div className="flex w-full h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* ─── SIDEBAR ─────────────────────────────────────────── */}
        <aside
          className={`
            relative flex flex-col h-screen flex-shrink-0
            bg-zinc-900 dark:bg-zinc-950
            border-r border-zinc-800
            transition-all duration-300 ease-in-out
            ${collapsed ? "w-[68px]" : "w-[220px]"}
          `}
        >
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

          {/* Logo */}
          <div
            className={`flex items-center h-[60px] px-4 border-b border-zinc-800 flex-shrink-0 ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/50">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-white font-semibold text-[13px] leading-tight tracking-wide">
                  Choco Kingdom
                </p>
                <p className="text-zinc-500 text-[10px] tracking-widest uppercase">
                  Admin Panel
                </p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 rounded-lg px-3 h-10
                    text-[13px] font-medium transition-all duration-150
                    ${collapsed ? "justify-center px-0" : ""}
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }
                  `}
                >
                  <item.icon
                    className={`flex-shrink-0 ${isActive ? "w-4 h-4" : "w-4 h-4"}`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && isActive && (
                    <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-70" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-zinc-800 flex-shrink-0 space-y-1">
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 h-9 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors text-[12px] ${collapsed ? "justify-center px-0" : ""}`}
            >
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
              {!collapsed && <span>Thu gọn</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 rounded-lg px-3 h-9 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors text-[13px] ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? "Đăng xuất" : undefined}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="h-[60px] flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              {activeItem && (
                <>
                  <span className="text-zinc-400 text-sm">Admin</span>
                  <span className="text-zinc-300 text-sm">/</span>
                  <span className="text-zinc-800 dark:text-zinc-100 font-semibold text-sm">
                    {activeItem.label}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Administrator
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-screen-xl mx-auto p-6 md:p-8">
              <ActiveComponent />
            </div>
          </div>
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </>
  );
}
