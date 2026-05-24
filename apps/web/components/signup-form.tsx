"use client";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import { setAccessToken } from "@/services/axios";
import { authRegister } from "@/services/auth.service";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu >= 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { accessToken, user } = await authRegister({
        email: form.email,
        password: form.password,
      });
      setAccessToken(accessToken);
      dispatch(login(user));
      toast.success("Tạo tài khoản thành công!");
      router.push("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng ký thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { level: 1, label: "Quá ngắn", color: "bg-red-400" };
    if (p.length < 8) return { level: 2, label: "Trung bình", color: "bg-amber-400" };
    if (p.length >= 8 && /[A-Z]/.test(p)) return { level: 3, label: "Mạnh", color: "bg-green-500" };
    return { level: 2, label: "Khá tốt", color: "bg-amber-400" };
  })();

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="min-h-screen flex bg-white">

        {/* ── Hình bên trái ── */}
        <div className="hidden lg:block relative w-[480px] flex-shrink-0 overflow-hidden">
          <img
            src="/image/newlog.jpg"
            alt="Choco Kingdom"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />

          {/* Perks overlay */}
          <div className="absolute bottom-10 left-8 right-8 space-y-3">
            
            {[
              "Ưu đãi độc quyền cho thành viên mới",
              "Theo dõi đơn hàng dễ dàng",
              "Tích điểm đổi quà hấp dẫn",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span className="text-white/90 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form bên phải ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-stone-50">
          <div className="w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <span className="text-4xl">🍫</span>
              <p className="mt-2 text-lg font-bold text-stone-800">Choco Kingdom</p>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[28px] font-black text-stone-900 tracking-tight leading-tight">
                Tạo tài khoản<br />
                <span className="text-amber-600">miễn phí</span>
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                Tham gia ngay để nhận ưu đãi thành viên mới
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700" htmlFor="email">
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
                      errors.email ? "border-red-300 bg-red-50" : "border-stone-200 hover:border-stone-300"
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
                <label className="text-sm font-semibold text-stone-700" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-11 pl-10 pr-11 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all",
                      "focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
                      errors.password ? "border-red-300 bg-red-50" : "border-stone-200 hover:border-stone-300"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {passwordStrength && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            lvl <= passwordStrength.level
                              ? passwordStrength.color
                              : "bg-stone-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn(
                      "text-[11px] font-medium",
                      passwordStrength.level === 1 ? "text-red-500" :
                      passwordStrength.level === 2 ? "text-amber-500" : "text-green-600"
                    )}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.password[0]}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700" htmlFor="confirmPassword">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={cn(
                      "w-full h-11 pl-10 pr-11 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white outline-none transition-all",
                      "focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
                      errors.confirmPassword ? "border-red-300 bg-red-50" :
                      form.confirmPassword && form.confirmPassword === form.password ? "border-green-300 bg-green-50" :
                      "border-stone-200 hover:border-stone-300"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {form.confirmPassword && form.confirmPassword === form.password && (
                    <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.confirmPassword[0]}
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
                    Đang tạo tài khoản...
                  </>
                ) : (
                  <>
                    Tạo tài khoản
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

            {/* Login link */}
            <p className="text-center text-sm text-stone-500">
              Đã có tài khoản?{" "}
              <a href="/auth/login" className="font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2">
                Đăng nhập
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
