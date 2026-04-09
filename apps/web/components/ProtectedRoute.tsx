// components/ProtectedRoute.tsx
"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Giữ lại đường dẫn hiện tại để quay lại sau khi login
        router.replace(`/auth/login?redirect=${window.location.pathname}`);
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Hiển thị loader trong lúc kiểm tra
  if (isLoading || isChecking) {
    return <FullScreenLoader />;
  }

  // Nếu chưa login thì không render gì cả
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
