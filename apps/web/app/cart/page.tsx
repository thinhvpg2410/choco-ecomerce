"use client";

import { useEffect, useState } from "react";
import { addToCart, getCart, getProductById, updateCartItem } from "@/services/cart.service";
import { CartItem } from "@/types/type";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeFromCart } from "@/services/cart.service";
import Link from "next/link";


export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const cart = await getCart();
        const cartItems = cart?.items ?? [];
        setItems(cartItems);
        // Fetch thông tin product cho từng item
        const productIds = cartItems.map((item) => item.product_id);
        const products: Record<string, any> = {};
        
        const data = localStorage.getItem("checkout_cart");
        if (data) {
          const parsed = JSON.parse(data);
          console.log(parsed.items);
          console.log(parsed.subtotal);
        }
        
        await Promise.all(
          productIds.map(async (id) => {
            const product = await getProductById(id);
            products[id] = product;
          })
        );
        
        setProductsMap(products);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Lọc ra các item đã chọn
  const selectedItems = items.filter((item) =>
    selected.includes(String(item.product_id))
  );

  // Xóa sản phẩm khỏi giỏ
  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId);

      setItems((prev) =>
        prev.filter((item) => String(item.product_id) !== String(productId))
      );

      setSelected((prev) => prev.filter((id) => id !== String(productId)));
    } catch (error) {
      console.error("Xóa sản phẩm thất bại:", error);
    }
  };
  
  // Xử lý mua ngay
  const handleBuyNow = async () => {
  if (selectedItems.length === 0) {
    alert("Vui lòng chọn sản phẩm trước khi thanh toán");
    return;
  }

  const checkoutData = selectedItems.map((item) => ({
    product_id: item.product_id,
    name: item.product?.name ?? productsMap[item.product_id]?.name,
    image: item.product?.image_url ?? productsMap[item.product_id]?.image_url,
    price: item.price,
    quantity: item.quantity,
    stock: item.product?.stock ?? 100,
  }));

  localStorage.setItem(
    "checkout_cart",
    JSON.stringify({
      items: checkoutData,
      subtotal,
    })
  );

  window.location.href = "/checkout";
};

  // Tính tổng tiền của các sản phẩm đã chọn
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Định dạng tiền Việt
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  if (loading) return <p>Loading...</p>;

  // Chọn tất cả 
  const isAllSelected =
    items.length > 0 &&
    items.every((item) => selected.includes(item.product_id));

  const toggleSelectAll = () => {
    if (items.every((item) => selected.includes(item.product_id))) {
      setSelected([]);
    } else {
      setSelected(items.map((i) => i.product_id));
    }
  };
  
  // Cập nhật số lượng sản phẩm trong giỏ
  const updateQty = async (productId: string, delta: number) => {
    const item = items.find(
      (i) => String(i.product_id) === productId
    );
    if (!item) return;

    const stock = item.product?.stock ?? 100;

    const newQty = Math.max(
      1,
      Math.min(stock, item.quantity + delta)
    );

    // Đẩy sản phẩm update lên 
    setItems((prev) => {
    let moved: typeof prev[number] | null = null;

    const rest = prev.map((i) => {
      if (String(i.product_id) === productId) {
        moved = { ...i, quantity: newQty };
        return null;
      }
      return i;
    }).filter(Boolean) as typeof prev;

    return moved ? [moved, ...rest] : rest;
  });

    try {
      await updateCartItem({
        product_id: productId,
        quantity: newQty,
      });
    } catch (error) {
      console.error("Update cart failed:", error);

      // rollback nếu fail
      setItems((prev) =>
        prev.map((i) =>
          String(i.product_id) === productId
            ? item
            : i
        )
      );
    }
  };

  return (
    <div className="p-4 mx-auto py-6">
      <h1 className="text-xl font-bold mb-4">Giỏ hàng</h1>

      <div className="space-y-3 ">

        {/* HEADER */}
        <div className="grid grid-cols-12 items-center bg-gray-100 px-4 py-3 rounded-md text-sm font-semibold text-gray-700">
          
          <div className="col-span-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
            />
            <span>Tất cả</span>
          </div>

          <div className="col-span-4">
            Sản phẩm
          </div>

          <div className="col-span-2 text-center">
            Đơn giá
          </div>

          <div className="col-span-2 text-center">
            Số lượng
          </div>

          <div className="col-span-2 text-center">
            Số tiền
          </div>

          <div className="col-span-1 text-center">
            Thao tác
          </div>
        </div>

        {/* ITEMS */}
        {items.map((item) => (
          <div
          key={item.id}
          className="grid grid-cols-12 items-center border p-3 rounded-lg"
        >
          {/* Checkbox */}
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(String(item.product_id))}
              onChange={() => {
        setSelected((prev) =>
          prev.includes(String(item.product_id))
            ? prev.filter((id) => id !== String(item.product_id))
            : [...prev, String(item.product_id)]
        );
      }}
            />
          </div>

            {/* Sản phẩm */}
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <img
                  src={productsMap[item.product_id]?.image_url || item.product?.image_url || "https://via.placeholder.com/40"}
                  alt={productsMap[item.product_id]?.name || item.product?.name || "No product"}
                  className="w-full h-full object-cover rounded"
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

            {/* Đơn giá */}
            <div className="col-span-2 text-center font-semibold text-sm">
              {fmt(item.price)}
            </div>

            {/* Số lượng */}
            <div className="col-span-2 text-center w-min mx-auto">
              <div className="flex items-center border-[1.5px] border-[#f0ede8] rounded-[10px] overflow-hidden bg-[#fafafa]">
                  <button
                  onClick={() => updateQty(String(item.product_id), -1)}
                  disabled={item.quantity <= 1}
                  className="w-[30px] h-[28px] flex items-center justify-center text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                  >
                  −
                  </button>
                  <span className="min-w-[28px] text-center text-base font-bold text-[#1a1a1a]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(String(item.product_id), 1)}
                    disabled={item.quantity >= (item.product?.stock ?? 100)}
                  className="w-[30px] h-[28px] flex items-center justify-center text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                  >
                  +
                  </button>
              </div>
            </div>

            {/* Số tiền */}
            <div className="col-span-2 text-center text-red-500 font-semibold">
              {fmt(item.price * item.quantity)}
            </div>

            {/* Thao tác */}
            <div className="col-span-1 text-center hover:text-red-500 cursor-pointer"
            onClick={() => handleRemove(String(item.product_id))}
            >
              Xóa
            </div>
          </div>
        ))}
      </div>
      {/* Tổng tiền */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 rounded-md">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-10 text-lg">
          <div className="font-bold ">
            Tổng:
            <span className="text-xl font-bold text-red-500 p-3">
              {fmt(subtotal)}
            </span>
          </div>

          <Button
            onClick={handleBuyNow}
            className="p-5 px-10 rounded-sm text-lg font-semibold tracking-wide transition-all duration-300 bg-[#3b1d14] hover:bg-[#e7c27d] text-white hover:text-[#3b1d14] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Mua Ngay
          </Button>
        </div>
      </div>
    </div>
  );
}