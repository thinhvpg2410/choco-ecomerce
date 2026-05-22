"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";
import { setAccessToken } from "@/services/axios";
import { authLogin } from "@/services/auth.service";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Lock, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu >= 6 ký tự"),
});

export default function AdminLoginPage({
  className,
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({
      ...f,
      [e.target.id]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(form);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { accessToken, user } = await authLogin(form);

      // Chỉ admin mới được login ở đây
      if (user.role !== "admin") {
        toast.error("Bạn không có quyền truy cập Admin");
        return;
      }

      setAccessToken(accessToken);

      dispatch(login(user));
      await dispatch(fetchCart() as any);

      toast.success(`Chào mừng Admin ${user.username}`);

      router.replace("/admin");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden bg-black p-6",
        className,
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#7f1d1d,transparent_25%),radial-gradient(circle_at_bottom_left,#1e3a8a,transparent_25%)]" />

      {/* Blur circles */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <Card className="relative z-10 w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_50px_rgba(255,0,0,0.15)]">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-900/40">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-3xl font-black tracking-wide text-white">
              ADMIN PANEL
            </h1>

            <p className="mt-2 text-center text-sm text-slate-400">
              Đăng nhập dành riêng cho quản trị viên hệ thống
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email quản trị
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="h-12 border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-red-500"
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Mật khẩu
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />

                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="h-12 border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 focus:border-red-500"
                />
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password[0]}
                </p>
              )}
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-gradient-to-r from-red-600 to-red-700 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:from-red-500 hover:to-red-600"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-white/10 pt-5 text-center">
            <p className="text-xs text-slate-500">
              Hệ thống quản trị được bảo mật và giám sát 24/7
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
