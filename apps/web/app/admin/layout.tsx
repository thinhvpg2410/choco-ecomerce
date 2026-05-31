"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isLoading) return;
    if (pathname === "/admin/login") return;

    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) return <FullScreenLoader />;

  const isLoginPage = pathname === "/admin/login";

  return (
    <>
      {children}
    </>
  );
}
