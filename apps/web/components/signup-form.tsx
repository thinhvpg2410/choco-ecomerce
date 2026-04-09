"use client";
import { cn } from "@/services/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/services/axios";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import { useState } from "react";
import { setAccessToken } from "@/services/axios";
import { z } from "zod";
import { useRouter } from "next/navigation";
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});

  const registerSchema = z
    .object({
      email: z.string().email("Email không hợp lệ"),
      password: z.string().min(6, "Mật khẩu >= 6 ký tự"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Mật khẩu không khớp",
      path: ["confirmPassword"],
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setErrors({}); // clear lỗi

    try {
      const res = await api.post("/auth/register", {
        email: form.email,
        password: form.password,
      });

      const { accessToken, user } = res.data.data;

      setAccessToken(accessToken);

      dispatch(login(user));

      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleRegister} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
              </div>

              {/* EMAIL */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" value={form.email} onChange={handleChange} />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email[0]}</p>
                )}
              </Field>

              {/* PASSWORD */}
              <Field>
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password[0]}</p>
                )}
              </Field>

              {/* CONFIRM PASSWORD */}
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Xác nhận mật khẩu
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {errors.confirmPassword[0]}
                  </p>
                )}
              </Field>

              <Field>
                <Button type="submit">Tạo tài khoản</Button>
              </Field>

              <FieldSeparator>Hoặc tiếp tục với</FieldSeparator>

              <FieldDescription className="text-center">
                Bạn đã có tài khoản? <a href="/auth/login">Đăng nhập</a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
