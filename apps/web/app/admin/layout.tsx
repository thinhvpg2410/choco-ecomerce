"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // ✅ Cho phép truy cập trang admin login
    if (pathname === "/admin/login") return;

    // ❌ Chưa login
    if (!user) {
      router.replace("/admin/login");
      return;
    }

    // ❌ Không phải admin
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, router, pathname]);

  return <>{children}</>;
}
