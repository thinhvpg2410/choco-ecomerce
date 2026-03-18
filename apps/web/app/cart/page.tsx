import { cartItems, products } from "@/types/dataTest";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  // map cart với product
  const cart = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      ...item,
      product,
    };
  });

  const total = cart.reduce((sum, item) => {
    const price = item.product?.sale_price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>

      <div className="grid md:grid-cols-3 gap-10">
        {/* LEFT - LIST */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {cart.map((item) => {
            if (!item.product) return null;

            const price = item.product.sale_price ?? item.product.price;

            return (
              <div
                key={item.id}
                className="flex gap-5 border rounded-xl p-4 shadow-sm"
              >
                {/* IMAGE */}
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                {/* INFO */}
                <div className="flex flex-col flex-1 gap-2">
                  <h2 className="font-semibold text-lg">{item.product.name}</h2>

                  <p className="text-sm text-gray-500">
                    {price.toLocaleString()}đ
                  </p>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-3 mt-2">
                    <button className="px-3 py-1 border rounded">-</button>
                    <span>{item.quantity}</span>
                    <button className="px-3 py-1 border rounded">+</button>
                  </div>
                </div>

                {/* TOTAL ITEM */}
                <div className="font-semibold text-right">
                  {(price * item.quantity).toLocaleString()}đ
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="border rounded-xl p-6 shadow-md h-fit flex flex-col gap-5">
          <h2 className="text-xl font-semibold">Tổng đơn</h2>

          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span>
            <span>{total.toLocaleString()}đ</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Phí ship</span>
            <span>15,000đ</span>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Tổng</span>
            <span>{(total + 15000).toLocaleString()}đ</span>
          </div>

          <Button className="w-full py-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
}
