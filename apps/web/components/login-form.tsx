"use client";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import { fetchCart } from "@/store/cartSlice";
import { setAccessToken } from "@/services/axios";
import { authLogin } from "@/services/auth.service";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu >= 6 ký tự"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const { accessToken, user } = await authLogin({ ...form, guestCart });
      if (user.role !== "user") {
        toast.error("Trang này chỉ dành cho khách hàng");
        return;
      }
      setAccessToken(accessToken);
      dispatch(login(user));
      await dispatch(fetchCart() as any);
      toast.success(`Chào mừng ${user.username} quay trở lại!`);
      router.replace("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="min-h-screen flex bg-white">
        {/* ── Hình bên trái ── */}
        <div className="hidden lg:block relative w-[480px] flex-shrink-0 overflow-hidden">
          <img
            src="/image/login.jpg"
            alt="Choco Kingdom"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />

          
        </div>

        {/* ── Form bên phải ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-stone-50">
          <div className="w-full max-w-[400px]">
            

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[28px] font-black text-stone-900 tracking-tight leading-tight">
                Chào mừng
                <br />
                <span className="text-amber-600">quay trở lại!</span>
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                Đăng nhập để tiếp tục mua sắm nhé
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="text-sm font-semibold text-stone-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="ban@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-11 pl-10 pr-4 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all",
                      "focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-stone-200 hover:border-stone-300",
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  className="text-sm font-semibold text-stone-700"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-11 pl-10 pr-11 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all",
                      "focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-stone-200 hover:border-stone-300",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.password[0]}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-amber-200 hover:shadow-amber-300 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 font-medium">hoặc</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-stone-500">
              Chưa có tài khoản?{" "}
              <a
                href="/auth/register"
                className="font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                Đăng ký ngay
              </a>
            </p>

            {/* ToS */}
            <p className="mt-6 text-center text-[11px] text-stone-400 leading-relaxed">
              Bằng việc đăng nhập, bạn đồng ý với{" "}
              <a href="#" className="underline hover:text-stone-600">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="underline hover:text-stone-600">
                Chính sách bảo mật
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
