// components/AdminProtectedRoute.tsx
"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/auth/login?redirect=${window.location.pathname}`);
      } else if (user?.role !== "admin") {
        router.replace("/");
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Hiển thị loader trong lúc kiểm tra
  if (isLoading || isChecking) {
    return <FullScreenLoader />;
  }

  // Nếu chưa login hoặc không phải admin thì không render gì cả
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}