"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

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

import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();

  const navItemClass =
    "cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-pink-50 hover:text-pink-600";

  const dropdownItemClass =
    "block px-3 py-1.5 rounded-md text-sm transition-all duration-200 hover:bg-pink-50 hover:text-pink-600";

  return (
    <header className="border-b bg-white relative z-[1000]">
      {/* 🔥 GRID 3 CỘT */}
      <div className="container mx-auto grid grid-cols-3 h-16 items-center">
        {/* LEFT - LOGO */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-xl font-bold text-pink-600 hover:opacity-80 transition"
          >
            🍬 ChocoShop
          </Link>
        </div>

        {/* CENTER - MENU */}
        <div className="flex items-center justify-center gap-2">
          <Link href="/about" className={`${navItemClass} whitespace-nowrap`}>
            Giới thiệu
          </Link>

          <Link href="/product" className={`${navItemClass} whitespace-nowrap`}>
            Sản phẩm
          </Link>

          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {/* CATEGORY */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navItemClass}>
                  Loại
                </NavigationMenuTrigger>

                <NavigationMenuContent className="absolute top-full left-0 mt-2 w-[200px] rounded-md bg-white shadow-lg border p-2 z-[9999]">
                  <ul className="space-y-1">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?category=chocolate"
                          className={dropdownItemClass}
                        >
                          Chocolate
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?category=candy"
                          className={dropdownItemClass}
                        >
                          Candy
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?category=snack"
                          className={dropdownItemClass}
                        >
                          Snack
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* BRAND */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navItemClass}>
                  Thương hiệu
                </NavigationMenuTrigger>

                <NavigationMenuContent className="absolute top-full left-0 mt-2 w-[200px] rounded-md bg-white shadow-lg border p-2 z-[9999]">
                  <ul className="space-y-1">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?brand=oreo"
                          className={dropdownItemClass}
                        >
                          Oreo
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?brand=kitkat"
                          className={dropdownItemClass}
                        >
                          KitKat
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/products?brand=lotte"
                          className={dropdownItemClass}
                        >
                          Lotte
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT - ACTIONS */}
        <div className="flex items-center justify-end gap-4">
          {/* CART */}
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 cursor-pointer transition hover:text-pink-600 hover:scale-110" />
            <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
              2
            </span>
          </Link>

          {/* AUTH */}
          {!isAuthenticated ? (
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

              <DropdownMenuContent align="end">
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
                  onClick={() => dispatch(logout())}
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
