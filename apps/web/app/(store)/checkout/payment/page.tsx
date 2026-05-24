"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Receipt,
  AlertTriangle,
  QrCode,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { createOrder } from "@/services/order.service";
import { createPayment } from "@/services/payment.service";
import api from "@/services/axios";

import { Button } from "@/components/ui/button";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRef } from "react";



export default function PaymentPage() {
  const router = useRouter();
const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [placing, setPlacing] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const [checkingPayment, setCheckingPayment] = useState(false);
  

  // Trạng thái xử lý giao diện thành công sau khi quét mã/Thanh toán
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [verifyingQR, setVerifyingQR] = useState(false);

  const createdRef = useRef(false);


  const startCheckingPayment = (orderId: string) => {
    console.log("START POLLING:", orderId);

    setCheckingPayment(true);

    intervalRef.current = setInterval(async () => {
      try {
        console.log("CALL CHECK PAYMENT API");

        const res = await api.get(`/sepay/payment/${orderId}`);

        console.log("CHECK PAYMENT RESPONSE:", res.data);

        const status = res.data?.paymentStatus;

        console.log("PAYMENT STATUS:", status);

        if (status === "PAID") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          setCheckingPayment(false);
          setIsSuccess(true);

          toast.success("Thanh toán thành công!");

          localStorage.removeItem("pending_checkout");
          localStorage.removeItem("checkout_cart");
        }

        if (status === "FAILED") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          setCheckingPayment(false);
          toast.error("Thanh toán thất bại!");
          router.push("/checkout");
        }
      } catch (err) {
        console.error("CHECK PAYMENT ERROR:", err);
      }
    }, 3000);
  };


  // LOAD DATA FROM LOCALSTORAGE
  useEffect(() => {
    const raw = localStorage.getItem("pending_checkout");

    if (!raw) {
      router.push("/checkout");
      return;
    }

    setCheckoutData(JSON.parse(raw));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!checkoutData) return;
    if (checkoutData.payMethod !== "QR_BANK") return;

    if (createdRef.current) return;
    createdRef.current = true;

    handleCreateOrder();
  }, [checkoutData]);
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleCreateOrder = async (transactionCode?: string) => {
    try {
      setPlacing(true);

      const payload: any = {
        receiver_name:
          checkoutData.selectedAddress.receiver_name ||
          checkoutData.selectedAddress.receiverName,

        receiver_phone:
          checkoutData.selectedAddress.receiver_phone ||
          checkoutData.selectedAddress.receiverPhone,

        shipping_address: `${checkoutData.selectedAddress.address}, ${checkoutData.selectedAddress.ward}, ${checkoutData.selectedAddress.city}`,

        payment_method: checkoutData.payMethod,
        note: checkoutData.note,
        cart_item_ids: checkoutData.cartItemIds,
        buy_now: checkoutData.isBuyNow,
        coupon_code: checkoutData.appliedVouchers?.[0]?.code,
      };

      if (checkoutData.isBuyNow) {
        payload.product_id = checkoutData.buyNowProduct.product_id;
        payload.quantity = checkoutData.buyNowProduct.quantity;
      }

      const order = await createOrder(payload);
      setCreatedOrderId(order.id);

      const paymentRes = await createPayment({
        order_id: order.id,
        payment_method: checkoutData.payMethod,
        transaction_code: transactionCode,
      });

      // Nếu là QR BANK thì giữ lại giao diện để khách quét mã
      if (checkoutData.payMethod === "QR_BANK") {
        setQrUrl(paymentRes.qr_url);

        // START REAL CHECK
        startCheckingPayment(order.id);

        return;
      }

      // Đối với PayPal thành công -> Kích hoạt màn hình thành công luôn
      setIsSuccess(true);
      localStorage.removeItem("pending_checkout");
      localStorage.removeItem("checkout_cart");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Khởi tạo đơn hàng thất bại");
    } finally {
      setPlacing(false);
    }
  };

 const handleCancelPayment = () => {
   if (intervalRef.current) {
     clearInterval(intervalRef.current);
     intervalRef.current = null;
   }

   setCheckingPayment(false);

   if (confirm("Bạn có chắc chắn muốn hủy quá trình thanh toán này?")) {
     router.push("/checkout");
   }
 };

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-sm font-medium text-gray-500">
          Đang tải thông tin thanh toán...
        </p>
      </div>
    );
  }

  const {
    items,
    selectedAddress,
    total,
    subtotal,
    shipping,
    appliedVouchers,
    payMethod,
  } = checkoutData;
  const totalDiscount =
    appliedVouchers?.reduce((sum: number, v: any) => sum + v.discount, 0) || 0;
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  const paypalClientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    "ASFKGN8SnTQC9y2NLY2uY1Y3x28pKrY2V8Z4iqDAWYMaQPXmBFhkYrpXShl4JNbEYGRlUruBdjWi2ryl";

  // ==================== INTERFACE 1: THANH TOÁN THÀNH CÔNG ====================
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 text-center shadow-xl border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center scale-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Đặt hàng thành công!
          </h2>
          <p className="mt-2 text-sm text-gray-500 px-2">
            Cảm ơn bạn đã mua sắm tại Choco Kingdom. Đơn hàng của bạn đã được
            ghi nhận và đang chuẩn bị xử lý.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Mã đơn hàng:</span>
              <span className="font-bold text-gray-900">
                #{createdOrderId || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phương thức:</span>
              <span className="font-medium text-gray-800">
                {payMethod === "QR_BANK" ? "Chuyển khoản QR" : "Cổng PayPal"}
              </span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-2 mt-2">
              <span className="text-gray-900 font-medium">
                Tổng thanh toán:
              </span>
              <span className="font-extrabold text-rose-500">{fmt(total)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <Button
              onClick={() => router.push(`/order/${createdOrderId}`)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              Xem thông tin đơn hàng <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-12 rounded-xl font-medium text-gray-600"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== INTERFACE 2: GIAO DIỆN CHÍNH (2 CỘT) ====================
  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Nút quay lại nhanh */}
        <button
          onClick={handleCancelPayment}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại thông tin đặt hàng
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* CỘT TRÁI: TIẾN HÀNH THANH TOÁN (Chiếm 2 phần) */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
                  {payMethod === "QR_BANK" ? (
                    <QrCode className="w-5 h-5" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Cổng thanh toán an toàn
                  </h2>
                  <p className="text-xs text-gray-400">
                    Vui lòng hoàn tất bước thanh toán dưới đây
                  </p>
                </div>
              </div>

              {/* KHU VỰC QR BANK */}
              {payMethod === "QR_BANK" && (
                <div className="space-y-6">
                  {!qrUrl ? (
                    <div className="text-gray-500 flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                      <p className="text-sm font-medium">
                        Hệ thống đang tạo mã QR giao dịch...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl shadow-inner max-w-[280px]">
                        <img
                          src={qrUrl}
                          alt="Mã QR Chuyển Khoản"
                          className="w-full h-auto rounded-lg"
                        />
                      </div>

                      <div className="mt-4 max-w-sm space-y-1">
                        <p className="font-bold text-gray-900 text-base">
                          Quét mã QR bằng Ứng dụng Ngân hàng
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed px-4">
                          Mở app ngân hàng bất kỳ (Vietcombank, Techcombank,
                          MB,...) chọn chức năng quét **QR Pay** để hoàn tất tự
                          động điền thông tin.
                        </p>
                      </div>

                      <div className="w-full mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100 text-left flex gap-3 items-start">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Sau khi chuyển khoản thành công, vui lòng ấn vào nút
                          **"Xác nhận đã chuyển khoản"** bên dưới để hệ thống
                          cập nhật đơn hàng của bạn.
                        </p>
                      </div>

                      <div className="w-full mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-center justify-center gap-2 text-blue-700 text-sm font-medium">
                          {checkingPayment && (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang chờ xác nhận chuyển khoản từ ngân hàng...
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* KHU VỰC PAYPAL */}
              {payMethod === "PayPal" && paypalClientId && (
                <div className="py-4 px-2 space-y-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium mb-2">
                    Giá trị đơn hàng sẽ được tự động quy đổi tương đương sang
                    đơn vị **USD**.
                  </div>
                  <PayPalScriptProvider
                    options={{
                      "client-id": paypalClientId,
                      currency: "USD",
                      intent: "capture",
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        shape: "rect",
                        color: "blue",
                        height: 48,
                      }}
                      createOrder={async () => {
                        const usd = Math.max(
                          0.01,
                          Math.round((total / 23000) * 100) / 100,
                        );

                        const res = await api.post("/paypal/create-order", {
                          amount: usd,
                          currency: "USD",
                        });

                        return res.data.id;
                      }}
                      onApprove={async (data) => {
                        const res = await api.post("/paypal/capture-order", {
                          orderId: data.orderID,
                        });

                        await handleCreateOrder(res.data.id);
                      }}
                      onError={() => {
                        toast.error(
                          "PayPal gặp sự cố khi xử lý, vui lòng thử lại sau.",
                        );
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {payMethod === "PayPal" && !paypalClientId && (
                <div className="p-6 text-center border rounded-2xl bg-red-50 border-red-100">
                  <p className="text-red-500 font-semibold text-sm">
                    Lỗi kết nối cấu hình hệ thống: Thiếu PayPal Client ID (.env)
                  </p>
                </div>
              )}
            </div>

            {/* NÚT HỦY GIAO DỊCH AN TOÀN */}
            <Button
              variant="ghost"
              disabled={placing || verifyingQR}
              onClick={handleCancelPayment}
              className="w-full text-gray-400 hover:text-red-500 hover:bg-red-50 h-11 rounded-xl transition-all"
            >
              Hủy bỏ giao dịch và chọn lại phương thức
            </Button>
          </div>

          {/* CỘT PHẢI: THÔNG TIN ĐƠN HÀNG TỔNG QUAN (Chiếm 1 phần) */}
          <div className="space-y-4 md:sticky md:top-6">
            {/* Hộp địa chỉ nhận hàng */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" /> Địa chỉ giao hàng
              </h3>
              <div className="space-y-1 text-gray-600 text-xs">
                <p className="font-semibold text-gray-800">
                  {selectedAddress?.receiver_name ||
                    selectedAddress?.receiverName}
                  <span className="font-normal text-gray-400 ml-1">
                    (
                    {selectedAddress?.receiver_phone ||
                      selectedAddress?.receiverPhone}
                    )
                  </span>
                </p>
                <p className="leading-relaxed">
                  {selectedAddress?.address}, {selectedAddress?.ward},{" "}
                  {selectedAddress?.city}
                </p>
              </div>
            </div>

            {/* Danh sách tóm tắt sản phẩm mua */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-500" /> Sản phẩm mua
                ({items.length})
              </h3>
              <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto pr-1">
                {items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="py-2.5 flex gap-3 items-center first:pt-0 last:pb-0"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-50 border shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-xs truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 text-xs shrink-0">
                      {fmt(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi tiết biên lai thanh toán tổng cộng */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-500" /> Tóm tắt thanh toán
              </h3>

              <div className="space-y-2.5 text-xs pb-3 border-b border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Phí vận chuyển</span>
                  <span>{fmt(shipping)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Mã giảm giá</span>
                    <span>-{fmt(totalDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="font-black text-rose-500 text-lg">
                  {fmt(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
