"use client";

import { cn } from "@/lib/utils";
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
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export default function AdminLoginPage({
  className,
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));
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
      if (user.role !== "admin") {
        toast.error("Bạn không có quyền truy cập Admin");
        return;
      }
      setAccessToken(accessToken);
      dispatch(login(user));
      await dispatch(fetchCart() as any);
      toast.success(`Chào mừng, ${user.username}`);
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
      className={cn("min-h-screen flex bg-zinc-950 overflow-hidden", className)}
    >
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-zinc-900 border-r border-zinc-800 p-10 relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

        {/* Background glow */}
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/60">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-[15px] tracking-wide">
              Choco Kingdom
            </p>
            <p className="text-zinc-500 text-[10px] tracking-widest uppercase">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Center text */}
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
            Quản trị
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              toàn diện
            </span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-[260px]">
            Hệ thống quản lý tập trung — sản phẩm, đơn hàng, khách hàng và doanh
            thu trong một nơi.
          </p>

          {/* Feature list */}
          <div className="pt-4 space-y-2.5">
            {[
              "Quản lý sản phẩm & tồn kho",
              "Theo dõi đơn hàng thời gian thực",
              "Thống kê doanh thu chi tiết",
              "Quản lý khách hàng & mã giảm giá",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="text-zinc-400 text-[13px]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-zinc-600 text-[11px] relative z-10">
          Hệ thống bảo mật & giám sát 24/7
        </p>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/60">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <p className="text-white font-bold">Choco Kingdom Admin</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Đăng nhập
            </h1>
            <p className="text-zinc-500 text-sm mt-1.5">
              Chỉ dành cho quản trị viên được ủy quyền
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password[0]}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider note */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-zinc-600 text-[11px] text-center leading-relaxed">
              Truy cập trái phép sẽ bị ghi nhận và báo cáo.
              <br />
              Mọi thao tác đều được ghi log đầy đủ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
