"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCart, getProductById } from "@/services/cart.service";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});

  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenCart(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenCart(false);
    }, 150); // delay nhỏ để không bị flick
  };

  useEffect(() => {
    getCategories().then(setCategories);
    getBrands().then(setBrands);
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res: any = await getCart();

        let items = res?.data?.items || res?.items || res || [];

        setCartItems(items);

        const productIds = [...new Set(items.map((i: any) => i.product_id))];

        const map: Record<string, any> = {};

        await Promise.all(
          productIds.map(async (id: string) => {
            const p = await getProductById(id);
            if (p) map[id] = p;
          }),
        );

        setProductsMap(map);
      } catch (err) {
        console.error(err);
      }
    };

    loadCart();
  }, []);

  // Thay handleLogout:
  const handleLogout = async () => {
    await authLogout();
    dispatch(logout());
    window.location.href = "/";
  };

  const navItemClass =
    "cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-pink-50 hover:text-pink-600";

  const dropdownItemClass =
    "block px-3 py-1.5 rounded-md text-sm transition-all duration-200 hover:bg-pink-50 hover:text-pink-600";

  return (
    <header className="border-b bg-white relative z-[1000] sticky top-0 z-50 bg-white">
      <div className="container mx-auto grid grid-cols-3 h-16 items-center">
        {/* LEFT */}
        <div className="flex items-center">
          <Link href="/" className="hover:opacity-80 transition">
            <img src="/image/logo.png" alt="Choco Kingdom" className="h-20" />
          </Link>
        </div>

        {/* CENTER */}
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/information/aboutUs"
            className={`${navItemClass} whitespace-nowrap`}
          >
            Giới thiệu
          </Link>
          <Link href="/product" className={`${navItemClass} whitespace-nowrap`}>
            Sản phẩm
          </Link>

          {/*POLICY - CÁC CHÍNH SÁCH*/}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navItemClass}>
                  Chính sách
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className="p-2"
                  style={{
                    width: "var(--radix-navigation-menu-trigger-width)",
                  }}
                >
                  <ul className="space-y-1">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href={"/information/shippingPolicy"}
                          className={`${dropdownItemClass} whitespace-nowrap`}
                        >
                          Chính sách vận chuyển
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={"/information/privacyPolicy"}
                          className={`${dropdownItemClass} whitespace-nowrap`}
                        >
                          Chính sách bảo mật
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={"/information/returnPolicy"}
                          className={`${dropdownItemClass} whitespace-nowrap`}
                        >
                          Chính sách đổi trả
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href={"/information/termsOfUse"}
                          className={`${dropdownItemClass} whitespace-nowrap`}
                        >
                          Chính sách sử dụng
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* CATEGORY — NavigationMenu riêng */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navItemClass}>
                  Loại
                </NavigationMenuTrigger>

                <NavigationMenuContent
                  className="p-4 w-[320px] overflow-x-auto shadow-xl rounded-xl bg-white scrollbar-thin scrollbar-thumb-pink-300"
                  style={{
                    width: "260px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  {categories.length > 0 ? (
                    <div className="grid grid-rows-6 grid-flow-col gap-2 min-w-[400px]">
                      {categories.map((cat) => (
                        <NavigationMenuLink key={cat.id} asChild>
                          <Link
                            href={`/products?category=${cat.slug ?? cat.id}`}
                            className={`${dropdownItemClass} block text-sm py-2 px-2 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors whitespace-nowrap`}
                          >
                            {cat.name}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-400">
                      Đang tải...
                    </div>
                  )}
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
                  className="p-4 w-[260px] overflow-x-auto shadow-xl rounded-xl bg-white scrollbar-thin scrollbar-thumb-pink-300"
                  style={{
                    width: "220px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  {brands.length > 0 ? (
                    <div className="grid grid-rows-6 grid-flow-col gap-2 min-w-[400px]">
                      {brands.map((brand) => (
                        <NavigationMenuLink key={brand.id} asChild>
                          <Link
                            href={`/products?brand=${brand.slug ?? brand.id}`}
                            className={`${dropdownItemClass} block text-sm py-2 px-2 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors whitespace-nowrap`}
                          >
                            {brand.name}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-400">
                      Đang tải...
                    </div>
                  )}
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {/* RIGHT */}
        <div className="flex items-center justify-end gap-4">
          <div
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {/* ICON */}
            <div className="relative cursor-pointer">
              <ShoppingCart className="w-5 h-5 transition hover:text-pink-600 hover:scale-110" />
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
                {cartItems.length}
              </span>
            </div>

            {/* DROPDOWN */}
            <a href="/cart">
              {openCart && (
                <div
                  className="
                  absolute right-0 mt-3 w-80 p-3 rounded-xl shadow-lg border bg-white z-[9999]
                  animate-in fade-in zoom-in-95 duration-150
                "
                >
                  <div className="font-semibold mb-2">Giỏ hàng</div>

                  {cartItems.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      Chưa có sản phẩm
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => {
                        const product = productsMap[item.product_id] || {};
                        return (
                          <div key={item.product_id} className="flex gap-3 p-2">
                            <img
                              src={product.image_url || "/no-image.png"}
                              className="w-12 h-12 object-cover rounded-md"
                            />

                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {product.name || "Sản phẩm"}
                              </div>
                              <div className="text-xs text-gray-500">
                                x{item.quantity}
                              </div>
                              <div className="text-sm text-pink-600 font-semibold">
                                {(item.price * item.quantity).toLocaleString()}đ
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
            </a>
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
                  <Link href="/order">
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
