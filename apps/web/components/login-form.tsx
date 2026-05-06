"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import { clearCart } from "@/store/cartSlice";
import { setAccessToken } from "@/services/axios";
import { authLogin } from "@/services/auth.service";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const loginSchema = z.object({
  email:    z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu >= 6 ký tự"),
});

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const router   = useRouter();

  const [form,   setForm]   = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.id]: e.target.value }));
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

      setAccessToken(accessToken); // Quan trọng: Set token trước khi dispatch
      dispatch(login(user));

      toast.success(`Chào mừng ${user.username} quay trở lại!`);

      // Chuyển hướng dựa trên role của user
      const redirectPath = user.role === "admin" ? "/admin" : "/";
      router.replace(redirectPath);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleLogin} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Chào mừng bạn trở lại</h1>
                <p className="text-balance text-muted-foreground">
                  Đăng nhập vào tài khoản của bạn
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" value={form.email} onChange={handleChange} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email[0]}</p>}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <Input id="password" type="password" value={form.password} onChange={handleChange} />
                {errors.password && <p className="text-red-500 text-xs">{errors.password[0]}</p>}
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc tiếp tục với
              </FieldSeparator>

              <Field className="grid grid-cols-1 gap-4">
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Chưa có tài khoản? <a href="/auth/register">Đăng ký</a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img src="/image/login.jpg" alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <a href="#" className="underline">Điều khoản dịch vụ</a>{" "}và{" "}
        <a href="#" className="underline">Chính sách bảo mật</a>.
      </FieldDescription>
    </div>
  );
}