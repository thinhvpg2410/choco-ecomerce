import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Choco Kingdom",
};

// Admin layout KHÔNG có <html><body> (root layout đã xử lý)
// KHÔNG có Header/Footer (admin/ nằm ngoài group (store))
// Chỉ render children — toàn bộ UI do page.tsx quản lý
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
