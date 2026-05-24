"use client";

import { useDispatch } from "react-redux";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  MapPin,
  Tag,
  CreditCard,
  MessageSquare,
  Check,
  Loader2,
  X,
} from "lucide-react";
import Section from "@/components/checkout/Section";
import PayOption from "@/components/checkout/PayOption";
import SumRow from "@/components/checkout/SumRow";
import OrderItemsSection from "@/components/checkout/OrderItemsSection";
import AddressSection from "@/components/checkout/AddressSection";
import VoucherSection from "@/components/checkout/VoucherSection";
import OrderSummarySection from "@/components/checkout/OrderSummarySection";

import { getAddresses, createAddress } from "@/services/user-address.service";
import { applyCoupon } from "@/services/coupon.service";
import type { UserAddress } from "@/types/type";

import api from "@/services/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createOrder } from "@/services/order.service";
import { createPayment } from "@/services/payment.service";
import type { CartItem } from "@/types/type";
import { clearCartState } from "@/store/cartSlice";
import {
  AddressFormModal,
  type AddressFormData,
} from "@/components/address/AddressModal";
import ProtectedRoute from "@/components/ProtectedRoute";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const router = useRouter();

  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null,
  );
  const [orderLocked, setOrderLocked] = useState(false);
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const dispatch = useDispatch();
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVouchers, setAppliedVouchers] = useState<
    {
      code: string;
      discount: number;
      finalAmount: number;
      description?: string;
    }[]
  >([]);
  const [payMethod, setPayMethod] = useState<"COD" | "PayPal" | "QR_BANK">(
    "COD",
  );
  const [qrUrl, setQrUrl] = useState("");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);

  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<{
    product_id: string;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    setIsBuyNow(mode === "buy_now");
  }, []);

  // PayPal Configuration
  const paypalOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: "USD", // Khuyến nghị dùng USD
    intent: "capture" as const,
  };

  const goToPaymentPage = async () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    const checkoutData = {
      items,
      cartItemIds,
      selectedAddress,
      appliedVouchers,
      note,
      payMethod,
      subtotal,
      shipping: SHIPPING,
      total,
      isBuyNow,
      buyNowProduct,
    };

    localStorage.setItem("pending_checkout", JSON.stringify(checkoutData));

    router.push("/checkout/payment");
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = localStorage.getItem("checkout_cart");

        if (data) {
          const parsed = JSON.parse(data);

          setCartItemIds(parsed.cart_item_ids ?? []);

          if (parsed.buy_now) {
            setBuyNowProduct({
              product_id: parsed.product_id,
              quantity: Number(parsed.quantity ?? 1),
            });

            setItems([
              {
                id: parsed.product_id,
                name: parsed.name ?? "Sản phẩm",
                image: parsed.image ?? "",
                price: Number(parsed.price ?? 0),
                quantity: Number(parsed.quantity ?? 1),
              },
            ]);
          } else {
            setItems(parsed.items ?? []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCart(false);
      }
    };

    const loadAddresses = async () => {
      try {
        const res = await getAddresses();
        setAddresses(res);

        if (res.length > 0) setSelectedAddress(res[0]);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadData();
    loadAddresses();
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const normalizeCity = (city: string) =>
    city
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ");

  const isMetroCity = (city: string) => {
    const normalized = normalizeCity(city);
    return ["ho chi minh", "ha noi"].some((keyword) =>
      normalized.includes(keyword),
    );
  };

  const getShippingFee = (address: UserAddress | null) => {
    if (!address?.city) return 30000;
    return isMetroCity(address.city) ? 15000 : 30000;
  };

  // const SHIPPING = getShippingFee(selectedAddress);
  const SHIPPING = 0; 

  const totalDiscount = appliedVouchers.reduce(
    (sum, item) => sum + item.discount,
    0,
  );

  const total = Math.max(0, subtotal + SHIPPING - totalDiscount);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  console.log("📦 ITEMS STATE:", items);
  const applyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();

    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (appliedVouchers.some((v) => v.code === code)) {
      toast.error("Mã giảm giá đã được sử dụng");
      return;
    }

    try {
      const response = await applyCoupon({
        code,
        subtotal,
      });

      // 🟢 [LOG 1]: In toàn bộ dữ liệu gốc từ API trả về để kiểm tra cấu trúc
      console.log("🎁 [Voucher API Response gốc]:", response);

      // Tự động nhận diện cấu trúc dữ liệu từ các kiểu cấu hình Axios khác nhau
      let couponData = null;

      if (response?.data?.data) {
        // Kiểu 1: response.data = { success: true, data: { code, discount_amount... } }
        couponData = response.data.data;
      } else if (response?.data) {
        // Kiểu 2: response.data là thẳng object chứa thông tin voucher { code, discount_amount... }
        couponData = response.data.code ? response.data : response.data;
      } else if (response?.code) {
        // Kiểu 3: Đã unwrap qua interceptor, response chính là object voucher { code, discount_amount... }
        couponData = response;
      }

      // 🟢 [LOG 2]: In ra dữ liệu sau khi code cố gắng bóc tách
      console.log("🔍 [Dữ liệu Voucher bóc tách được]:", couponData);

      // Kiểm tra nếu không tìm thấy dữ liệu voucher hoặc thiếu trường code hợp lệ
      if (!couponData || !couponData.code) {
        const errorMsg =
          response?.message ||
          response?.data?.message ||
          "Mã giảm giá không hợp lệ (Sai cấu trúc dữ liệu)";
        toast.error(errorMsg);
        return;
      }

      const discount = Number(couponData.discount_amount || 0);

      if (discount > subtotal) {
        toast.error("Giảm giá vượt quá giá trị sản phẩm");
        return;
      }

      // Cập nhật State hiển thị giảm giá công khai
      setAppliedVouchers([
        {
          code: couponData.code,
          discount: discount,
          finalAmount: couponData.final_amount ?? subtotal - discount,
          description: `Giảm ${discount.toLocaleString("vi-VN")}đ từ mã ${couponData.code}`,
        },
      ]);

      setVoucherInput("");
      toast.success(`Áp dụng mã ${couponData.code} thành công!`);
    } catch (err: any) {
      // 🟢 [LOG 3]: In chi tiết khi API lỗi (ví dụ: lỗi mạng, lỗi 400, 500 từ server)
      console.error("❌ [Voucher Catch Error]:", {
        errorObject: err,
        responseData: err?.response?.data,
        status: err?.response?.status,
        message: err?.message,
      });

      const serverMessage = err?.response?.data?.message;

      if (Array.isArray(serverMessage)) {
        toast.error(serverMessage[0]);
      } else {
        toast.error(
          serverMessage || "Không thể kết nối đến máy chủ xử lý mã giảm giá",
        );
      }
    }
  };

  const placeOrder = async (paymentId?: string, paypalOrderId?: string) => {
    if (orderLocked) return;

    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setOrderLocked(true);
    setPlacing(true);

    try {
      const shippingAddress = `${selectedAddress.address}, ${selectedAddress.ward}, ${selectedAddress.city}`;

      const payload: any = {
        receiver_name:
          selectedAddress.receiver_name || selectedAddress.receiverName,
        receiver_phone:
          selectedAddress.receiver_phone || selectedAddress.receiverPhone,
        shipping_address: shippingAddress,
        payment_method: payMethod,
        note: note?.trim() || undefined,
        cart_item_ids: cartItemIds,
        buy_now: isBuyNow,
        coupon_code:
          appliedVouchers.length > 0 ? appliedVouchers[0].code : undefined,
      };

      if (isBuyNow && buyNowProduct) {
        payload.product_id = buyNowProduct.product_id;
        payload.quantity = Number(buyNowProduct.quantity || 1);
      }

      console.log("📤 Creating order with payload:", payload);

      const order = await createOrder(payload);

      // Tạo payment record
      const paymentRes = await createPayment({
        order_id: order.id,
        payment_method: payMethod,
        transaction_code: paymentId || paypalOrderId,
      });

      console.log("PAYMENT RES:", paymentRes);

      toast.success("Đặt hàng thành công!");

      localStorage.removeItem("checkout_cart");

      // clear redux cart badge
      dispatch(clearCartState());

      router.push(`/order/${order.id}`);
    } catch (err: any) {
      console.error("❌ Create order error:", err.response?.data || err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Đặt hàng thất bại, vui lòng thử lại",
      );
    } finally {
      setPlacing(false);

      // QR đang chờ thanh toán -> giữ lock
      if (payMethod !== "QR_BANK") {
        setOrderLocked(false);
      }
    }
  };

  if (loadingCart || loadingAddress) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!items.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
          <div className="max-w-xl w-full rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Không có sản phẩm để thanh toán
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Vui lòng chọn sản phẩm trong giỏ hàng để tới trang thanh toán.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => router.push("/cart")}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Quay lại giỏ hàng
              </Button>
              <Button onClick={() => router.push("/")} variant="outline">
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f5f7]">
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight pb-1">
            Đặt hàng
          </h1>

          <OrderItemsSection items={items} subtotal={subtotal} fmt={fmt} />

          {/* Địa chỉ giao hàng */}
          <AddressSection
            addresses={addresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            setAddrOpen={setAddrOpen}
          />

          {/* Voucher */}
          <VoucherSection
            voucherInput={voucherInput}
            setVoucherInput={setVoucherInput}
            applyVoucher={applyVoucher}
            appliedVouchers={appliedVouchers}
            setAppliedVouchers={setAppliedVouchers}
            fmt={fmt}
          />

          {/* Thanh toán */}
          <Section
            icon={<CreditCard className="w-4 h-4 text-blue-500" />}
            iconBg="bg-blue-50"
            title="Phương thức thanh toán"
          >
            <div className="flex flex-col gap-2">
              <PayOption
                selected={payMethod === "COD"}
                onClick={() => setPayMethod("COD")}
                iconBg="bg-orange-50"
                icon={<ShoppingBag className="w-4 h-4 text-orange-500" />}
                name="Thanh toán khi nhận hàng (COD)"
                desc="Trả tiền mặt khi nhận hàng"
              />

              <PayOption
                selected={payMethod === "PayPal"}
                onClick={() => setPayMethod("PayPal")}
                iconBg="bg-blue-50"
                icon={<CreditCard className="w-4 h-4 text-blue-600" />}
                name="Thanh toán qua PayPal"
                desc="Thanh toán an toàn, nhanh chóng bằng PayPal"
              />

              <PayOption
                selected={payMethod === "QR_BANK"}
                onClick={() => setPayMethod("QR_BANK")}
                iconBg="bg-emerald-50"
                icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
                name="Chuyển khoản ngân hàng (QR Bank)"
                desc="Quét QR để thanh toán nhanh"
              />
            </div>

            {/* PayPal Buttons */}
            {payMethod === "PayPal" && (
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", color: "blue" }}
                    createOrder={async () => {
                      if (!selectedAddress) {
                        toast.error("Vui lòng chọn địa chỉ giao hàng");
                        throw new Error("No address");
                      }
                      try {
                        const usdAmount = Math.max(
                          0.01,
                          Math.round((total / 23000) * 100) / 100,
                        ); // đảm bảo tối thiểu 0.01 USD

                        console.log(
                          `🔄 Gửi amount = ${usdAmount} USD (từ ${total}đ)`,
                        );

                        const response = await api.post(
                          "/paypal/create-order",
                          {
                            amount: usdAmount,
                            currency: "USD",
                            description: `Đơn hàng Choco Kingdom #${Date.now()}`,
                          },
                        );

                        console.log("✅ PayPal Order created:", response.data);
                        return response.data.id;
                      } catch (err: any) {
                        console.error(
                          "❌ Create Order Failed:",
                          err.response?.data || err,
                        );

                        const errorMsg =
                          err.response?.data?.message || err.message;
                        toast.error(`Lỗi tạo đơn PayPal: ${errorMsg}`);
                        throw err;
                      }
                    }}
                    onApprove={async (data) => {
                      try {
                        const response = await api.post(
                          "/paypal/capture-order",
                          {
                            orderId: data.orderID,
                          },
                        );

                        console.log("✅ Payment captured:", response.data);

                        toast.success("Thanh toán PayPal thành công!");

                        await placeOrder(response.data.id, data.orderID);
                      } catch (err: any) {
                        console.error("onApprove Error:", err);

                        toast.error(
                          err?.response?.data?.message ||
                            "Xác nhận thanh toán thất bại",
                        );
                      }
                    }}
                    onError={(err) => {
                      console.error("PayPal SDK Error:", err);
                      toast.error("Lỗi PayPal. Vui lòng thử lại sau.");
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {payMethod === "QR_BANK" && qrUrl && (
              <div className="bg-white rounded-2xl border p-5 mt-4">
                <h3 className="text-center font-bold text-lg mb-4">
                  Quét mã QR để thanh toán
                </h3>

                <img src={qrUrl} alt="QR Payment" className="w-72 mx-auto" />

                <p className="text-center text-sm text-gray-500 mt-4">
                  Hệ thống sẽ tự động xác nhận sau khi chuyển khoản
                </p>
              </div>
            )}
          </Section>

          {/* Lời nhắn */}
          <Section
            icon={<MessageSquare className="w-4 h-4 text-green-600" />}
            iconBg="bg-green-50"
            title="Lời nhắn"
          >
            <Textarea
              placeholder="Ghi chú cho người bán..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl text-sm resize-none h-20 border-gray-200 focus:border-rose-400"
            />
          </Section>

          {/* Tổng tiền - Chỉ hiển thị khi chọn COD */}

          <OrderSummarySection
            itemsLength={items.length}
            subtotal={subtotal}
            SHIPPING={SHIPPING}
            appliedVouchers={appliedVouchers}
            total={total}
            fmt={fmt}
            placing={placing}
            orderLocked={orderLocked}
            payMethod={payMethod}
            placeOrder={() => placeOrder()}
            // nhóm dữ liệu để navigate
            selectedAddress={selectedAddress}
            items={items}
            cartItemIds={cartItemIds}
            note={note}
            isBuyNow={isBuyNow}
            buyNowProduct={buyNowProduct}
          />
        </div>

        {addrOpen && (
          <AddressFormModal
            initial={null}
            onSave={async (data: any) => {
              const created = await createAddress({
                receiverName: data.receiverName,
                receiverPhone: data.receiverPhone,
                address: data.address,
                ward: data.ward,
                city: data.city,
              });

              setAddresses((prev) => [...prev, created]);
              setSelectedAddress(created);

              setAddrOpen(false);

              toast.success("Thêm địa chỉ thành công");
            }}
            onClose={() => setAddrOpen(false)}
            title="Địa chỉ nhận hàng"
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

