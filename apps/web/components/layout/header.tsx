"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { setAccessToken } from "@/services/axios";
import { authLogout } from "@/services/auth.service";


import { getCategories, type Category } from "@/services/category.service";
import { getBrands, type Brand } from "@/services/brand.service";

export function Header() {
  const [openCart, setOpenCart] = useState(false);
  const router = useRouter();
  const mockCartItems = [
    {
      id: "1",
      name: "Socola Đen 70%",
      image: "/choco1.jpg",
      price: 50000,
      quantity: 2,
    },
    {
      id: "2",
      name: "Socola Hạnh Nhân",
      image: "/choco2.jpg",
      price: 75000,
      quantity: 1,
    },
  ];

  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
    getBrands().then(setBrands);
  }, []);

 // Thay handleLogout:
const handleLogout = async () => {
  await authLogout(); // gọi API + clear token trong 1 chỗ
  dispatch(logout());
  window.location.href = "/";
};

  const navItemClass =
    "cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-pink-50 hover:text-pink-600";

  const dropdownItemClass =
    "block px-3 py-1.5 rounded-md text-sm transition-all duration-200 hover:bg-pink-50 hover:text-pink-600";

  return (
    <header className="border-b bg-white relative z-[1000]">
      <div className="container mx-auto grid grid-cols-3 h-16 items-center">
        {/* LEFT */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-xl font-bold text-pink-600 hover:opacity-80 transition"
          >
            🍬 ChocoShop
          </Link>
        </div>

        {/* CENTER */}
        <div className="flex items-center justify-center gap-2">
          <Link href="/about" className={`${navItemClass} whitespace-nowrap`}>
            Giới thiệu
          </Link>
          <Link href="/product" className={`${navItemClass} whitespace-nowrap`}>
            Sản phẩm
          </Link>

          {/* CATEGORY — NavigationMenu riêng */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navItemClass}>
                  Loại
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className="p-2"
                  style={{
                    width: "var(--radix-navigation-menu-trigger-width)",
                  }}
                >
                  <ul className="space-y-1">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <li key={cat.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/products?category=${cat.slug ?? cat.id}`}
                              className={dropdownItemClass}
                            >
                              {cat.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-1.5 text-sm text-gray-400">
                        Đang tải...
                      </li>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* BRAND — NavigationMenu riêng */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navItemClass}>
                  Thương hiệu
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className="p-2"
                  style={{
                    width: "var(--radix-navigation-menu-trigger-width)",
                  }}
                >
                  <ul className="space-y-1">
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <li key={brand.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/products?brand=${brand.slug ?? brand.id}`}
                              className={dropdownItemClass}
                            >
                              {brand.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-1.5 text-sm text-gray-400">
                        Đang tải...
                      </li>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-4">
          <div
            className="relative"
            onMouseEnter={() => setOpenCart(true)}
            onMouseLeave={() => setOpenCart(false)}
          >
            {/* ICON */}
            <div className="relative cursor-pointer">
              <ShoppingCart className="w-5 h-5 transition hover:text-pink-600 hover:scale-110" />
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
                {mockCartItems.length}
              </span>
            </div>

            {/* DROPDOWN */}
            {openCart && (
              <div
                className="
        absolute right-0 mt-3 w-80 p-3 rounded-xl shadow-lg border bg-white z-[9999]
        animate-in fade-in zoom-in-95 duration-150
      "
              >
                <div className="font-semibold mb-2">Giỏ hàng</div>

                {mockCartItems.length === 0 ? (
                  <div className="text-sm text-gray-400">Chưa có sản phẩm</div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {mockCartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        <img
                          src={item.image}
                          className="w-12 h-12 object-cover rounded-md border"
                        />

                        <div className="flex-1">
                          <div className="text-sm font-medium line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            x{item.quantity}
                          </div>
                          <div className="text-sm text-pink-600 font-semibold">
                            {(item.price * item.quantity).toLocaleString()}đ
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* BUTTON */}
                <div className="mt-3">
                  <Button
                    className="w-full"
                    onClick={() => router.push("/cart")}
                  >
                    Xem giỏ hàng
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="transition hover:bg-pink-50 hover:text-pink-600"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer transition hover:scale-105 hover:ring-2 hover:ring-pink-400">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback>
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[9999]">
                <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer hover:bg-pink-50">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownMenuItem className="cursor-pointer hover:bg-pink-50">
                      Orders
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 cursor-pointer hover:bg-red-50"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
