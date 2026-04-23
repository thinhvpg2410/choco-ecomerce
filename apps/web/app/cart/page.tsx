"use client";

import { useEffect, useState } from "react";
import {
  getCart,
  getProductById,
  updateCartItem,
  removeFromCart,
} from "@/services/cart.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CartItemType = {
  product_id: string;
  quantity: number;
  price: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadCart = async () => {
      try {
        const res: any = await getCart(); 

        // Xử lý cả 2 trường hợp backend trả về
        let items: CartItemType[] = [];

        if (res?.data?.items) {
          items = res.data.items;
        } else if (res?.items) {
          items = res.items;
        } else if (Array.isArray(res)) {
          items = res;
        }

        setCartItems(items);

        // Fetch chi tiết sản phẩm (name, image, stock...)
        const productIds = [...new Set(items.map((item) => item.product_id))];

        const products: Record<string, any> = {};
        await Promise.all(
          productIds.map(async (id: string) => {
            const product = await getProductById(id);
            if (product) products[id] = product;
          }),
        );

        setProductsMap(products);
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Computed
  const selectedItems = cartItems.filter((item) =>
    selected.includes(item.product_id),
  );

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const isAllSelected =
    cartItems.length > 0 &&
    cartItems.every((item) => selected.includes(item.product_id));

  // Handlers
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      setSelected(cartItems.map((i) => i.product_id));
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId);
      setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
      setSelected((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error("Xóa thất bại:", error);
    }
  };

  const updateQty = async (productId: string, delta: number) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;

    const product = productsMap[productId];
    const stock = product?.stock ?? 100;

    const newQty = Math.max(1, Math.min(stock, item.quantity + delta));
    if (newQty === item.quantity) return;

    setCartItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: newQty } : i,
      ),
    );

    try {
      await updateCartItem({ product_id: productId, quantity: newQty });
    } catch (error) {
      console.error("Cập nhật số lượng thất bại:", error);
      setCartItems((prev) =>
        prev.map((i) =>
          i.product_id === productId ? { ...i, quantity: item.quantity } : i,
        ),
      );
    }
  };

  const handleBuyNow = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm trước khi thanh toán");
      return;
    }

    const checkoutData = selectedItems.map((item) => {
      const prod = productsMap[item.product_id] || {};
      return {
        product_id: item.product_id,
        name: prod.name || "Sản phẩm",
        image: prod.image_url || "",
        price: item.price,
        quantity: item.quantity,
        stock: prod.stock ?? 100,
      };
    });

    localStorage.setItem(
      "checkout_cart",
      JSON.stringify({ items: checkoutData, subtotal }),
    );

    window.location.href = "/checkout";
  };

  if (loading)
    return <div className="p-8 text-center">Đang tải giỏ hàng...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="p-8 text-center py-20">
        <p className="text-xl">Giỏ hàng của bạn đang trống</p>
        <Link
          href="/"
          className="mt-4 inline-block text-[#3b1d14] hover:underline"
        >
          Tiếp tục mua sắm →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng ({cartItems.length})</h1>

      {/* Header */}
      <div className="grid grid-cols-12 bg-gray-100 px-4 py-3 rounded-md text-sm font-semibold text-gray-700 mb-4">
        <div className="col-span-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
          />
          <span>Tất cả</span>
        </div>
        <div className="col-span-4">Sản phẩm</div>
        <div className="col-span-2 text-center">Đơn giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-2 text-center">Số tiền</div>
        <div className="col-span-1 text-center">Thao tác</div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {cartItems.map((item) => {
          const product = productsMap[item.product_id] || {};

          return (
            <div
              key={item.product_id}
              className="grid grid-cols-12 items-center border p-4 rounded-xl bg-white"
            >
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(item.product_id)}
                  onChange={() =>
                    setSelected((prev) =>
                      prev.includes(item.product_id)
                        ? prev.filter((id) => id !== item.product_id)
                        : [...prev, item.product_id],
                    )
                  }
                />
              </div>
              <div>
                <Link href={`/product/${item.product_id}`} className="group">
                  <p className="font-medium hover:text-[#3b1d14] transition-colors">
                    {productsMap[item.product_id]?.name ?? item.product?.name ?? "No product"}
                  </p>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {/* Tổng tiền */}
      <div className="sticked bg-white border-t shadow-lg z-50 rounded-md">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-10 text-lg">
          <div className="font-bold ">
            Tổng:
            <span className="text-xl font-bold text-red-500 p-3">
              {fmt(subtotal)}
            </span>
          </div>

          <Button
            onClick={handleBuyNow}
            disabled={selectedItems.length === 0}
            className="px-14 py-6 text-lg font-semibold bg-[#3b1d14] hover:bg-[#e7c27d] hover:text-[#3b1d14] disabled:bg-gray-400"
          >
            Mua Ngay ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
