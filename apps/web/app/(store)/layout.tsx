import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";

// Tất cả trang bán hàng nằm trong group (store):
//   app/(store)/page.tsx        → "/"
//   app/(store)/products/...   → "/products/..."
//   app/(store)/cart/page.tsx  → "/cart"
// Dấu ngoặc đơn (store) không ảnh hưởng URL.

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}
