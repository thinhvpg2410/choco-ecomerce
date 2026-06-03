"use client";

import { useEffect, useState, useRef } from "react";
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
  ChevronRight,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/services/order.service";
import { createPayment } from "@/services/payment.service";
import api from "@/services/axios";
import { fetchCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useDispatch } from "react-redux";
import { clearCartState, restoreCartState } from "@/store/cartSlice";
 
export default function PaymentPage() {
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [placing, setPlacing] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [verifyingQR, setVerifyingQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [countdownActive, setCountdownActive] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const createdRef = useRef(false);
  const dispatch = useDispatch();
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startCountdown = () => {
    setTimeLeft(120);
    setCountdownActive(true);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdownActive(false);
    toast.error("Hết thời gian thanh toán. Vui lòng thử lại.");
    localStorage.removeItem("pending_checkout");
    localStorage.removeItem("payment_meta");
    router.push("/checkout");
  };

  useEffect(() => {
    const raw = localStorage.getItem("pending_checkout");
    if (!raw) {
      router.push("/checkout");
      return;
    }
    setCheckoutData(JSON.parse(raw));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!checkoutData) return;
    if (createdRef.current) return;
    createdRef.current = true;
    if (
      checkoutData.payMethod === "QR_BANK" ||
      checkoutData.payMethod === "COD"
    ) {
      handleCreateOrder();
    }
  }, [checkoutData]);

  useEffect(() => {
    const meta = localStorage.getItem("payment_meta");
    if (!meta) return;
    const parsed = JSON.parse(meta);
    if (parsed.method === "PayPal" && parsed.paypalOrderId) {
      handleCreateOrder(parsed.paypalOrderId);
    }
  }, [checkoutData]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setCheckingPayment(false);
    };
  }, []);

  const startCheckingPayment = (orderId: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCheckingPayment(true);
    startCountdown();
    intervalRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/sepay/payment/${orderId}`);
        const status = res.data?.paymentStatus;
        if (status === "PAID") {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setCheckingPayment(false);
          localStorage.removeItem("pending_checkout");
          localStorage.removeItem("checkout_cart");
          localStorage.removeItem("payment_meta");
          dispatch(clearCartState());
          dispatch(fetchCart() as any);
          setIsSuccess(true);
          toast.success("Thanh toán thành công!");
        }
        if (status === "FAILED") {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setCheckingPayment(false);
          toast.error("Thanh toán thất bại!");
          router.push("/checkout");
        }
      } catch (err) {
        console.error("CHECK PAYMENT ERROR:", err);
        setCheckingPayment(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCheckingPayment(false);
    };
  }, []);

  const handleCreateOrder = async (transactionCode?: string) => {
    if (!checkoutData || placing) return;
    try {
      setPlacing(true);
      const addr = checkoutData.selectedAddress;
      const payload: any = {
        receiver_name: addr.receiverName || addr.receiver_name,
        receiver_phone: addr.receiverPhone || addr.receiver_phone,
        shipping_address: `${addr.address}, ${addr.ward}, ${addr.city}`,
        payment_method: checkoutData.payMethod,
        note: checkoutData.note || "",
        cart_item_ids: checkoutData.cartItemIds || [],
        buy_now: checkoutData.isBuyNow || false,
        coupon_code: checkoutData.appliedVouchers?.[0]?.code || null,
        is_hcm: isHCM,
      };
      if (checkoutData.isBuyNow) {
        payload.product_id = checkoutData.buyNowProduct.product_id;
        payload.quantity = checkoutData.buyNowProduct.quantity;
      }
      const order = await createOrder(payload);
      setCreatedOrderId(order.id);
      setConfirmedTotal(order.final_amount);

      if (checkoutData.payMethod === "QR_BANK") {
        const paymentRes = await createPayment({
          order_id: order.id,
          payment_method: "QR_BANK",
        });
        setQrUrl(paymentRes.qr_url || paymentRes.qrUrl || "");
        startCheckingPayment(order.id);
        return;
      }

      await createPayment({
        order_id: order.id,
        payment_method: checkoutData.payMethod,
        transaction_code: transactionCode,
      });
      handlePaymentSuccess(order.id);
    } catch (err: any) {
      console.error(err);
      createdRef.current = false;
      toast.error(err?.response?.data?.message || "Khởi tạo đơn hàng thất bại");
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdownActive(false);
    setCheckingPayment(false);
    dispatch(clearCartState());
    dispatch(fetchCart() as any);
    localStorage.removeItem("pending_checkout");
    localStorage.removeItem("checkout_cart");
    localStorage.removeItem("payment_meta");
    localStorage.removeItem("cart_backup"); 
    setIsSuccess(true);
    setCreatedOrderId(orderId);
    toast.success("Thanh toán thành công!");
  };

  const handleCancelPayment = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCheckingPayment(false);
    setCountdownActive(false);

    if (
      confirm("Bạn có chắc chắn muốn hủy quá trình thanh toán này và quay lại?")
    ) {
      localStorage.removeItem("pending_checkout");
      localStorage.removeItem("payment_meta");

      const backup = localStorage.getItem("cart_backup");
      if (backup) {
        const items = JSON.parse(backup);
        dispatch(restoreCartState(items)); 
      }

      router.push("/cart");
    }
  };

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F8] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
        <p className="text-sm text-gray-400 font-medium">
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
    isHCM,
  } = checkoutData;
  const totalDiscount =
    appliedVouchers?.reduce((sum: number, v: any) => sum + v.discount, 0) || 0;
  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
  const paypalClientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    "ASFKGN8SnTQC9y2NLY2uY1Y3x28pKrY2V8Z4iqDAWYMaQPXmBFhkYrpXShl4JNbEYGRlUruBdjWi2ryl";

  /* ── SUCCESS SCREEN ── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-11 h-11 text-emerald-500" />
          </div>
          <h2
            className="text-2xl font-black text-gray-900 tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Đặt hàng thành công!
          </h2>
          <p className="mt-2.5 text-sm text-gray-400 leading-relaxed px-4">
            Cảm ơn bạn đã tin tưởng Choco Kingdom. Đơn hàng của bạn đã được ghi
            nhận.
          </p>

          {/* Order info */}
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Mã đơn hàng</span>
              <span className="font-bold text-gray-900 font-mono">
                #{createdOrderId?.slice(-8)?.toUpperCase() || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Phương thức</span>
              <span className="font-medium text-gray-700">
                {payMethod === "QR_BANK"
                  ? "Chuyển khoản QR"
                  : payMethod === "COD"
                    ? "COD"
                    : "PayPal"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
              <span className="font-bold text-gray-900">Tổng thanh toán</span>
              <span className="font-black text-orange-600 text-lg">
                {fmt(confirmedTotal || total)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              onClick={() => router.push(`/order/${createdOrderId}`)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              Xem chi tiết đơn hàng
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-11 rounded-xl font-medium text-gray-600 border-gray-200"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── PAYMENT SCREEN ── */
  return (
    <div className="min-h-screen bg-[#F7F7F8] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <button
            onClick={() => router.push("/cart")}
            className="text-orange-500 font-semibold hover:text-orange-600"
          >
            Giỏ hàng
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            onClick={handleCancelPayment}
            className="text-orange-500 font-semibold hover:text-orange-600"
          >
            Đặt hàng
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-gray-800">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
          {/* ── LEFT: PAYMENT WIDGET ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  {payMethod === "QR_BANK" ? (
                    <QrCode className="w-4.5 h-4.5 text-orange-500" />
                  ) : (
                    <CreditCard className="w-4.5 h-4.5 text-orange-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Cổng thanh toán an toàn
                  </h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Shield className="w-3 h-3" />
                    Kết nối mã hóa SSL 256-bit
                  </p>
                </div>
              </div>

              <div className="p-6">
                {/* QR BANK */}
                {payMethod === "QR_BANK" && (
                  <div className="space-y-6">
                    {!qrUrl ? (
                      <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                        <p className="text-sm font-medium">
                          Đang tạo mã QR giao dịch...
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-5">
                        {/* QR code */}
                        <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                          <img
                            src={qrUrl}
                            alt="QR Payment"
                            className="w-56 h-56 object-contain rounded-lg"
                          />
                        </div>

                        <div>
                          <p className="font-bold text-gray-900">
                            Quét mã bằng ứng dụng ngân hàng
                          </p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs">
                            Mở app bất kỳ (Vietcombank, Techcombank, MB...) và
                            chọn chức năng QR Pay
                          </p>
                        </div>

                        {/* Warning */}
                        <div className="w-full p-3.5 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start text-left">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800 leading-relaxed">
                            Không thay đổi nội dung chuyển khoản. Hệ thống sẽ tự
                            động xác nhận sau khi nhận tiền.
                          </p>
                        </div>

                        {/* Checking status */}
                        {checkingPayment && (
                          <div className="w-full p-3.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang chờ xác nhận từ ngân hàng...
                          </div>
                        )}

                        {/* Countdown timer */}
                        {countdownActive && (
                          <div
                            className={`w-full p-3.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                              timeLeft <= 30
                                ? "bg-red-50 border-red-100 text-red-600"
                                : "bg-gray-50 border-gray-100 text-gray-600"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            <span>
                              Mã QR hết hạn sau:{" "}
                              <span className="font-mono font-bold text-base">
                                {formatTime(timeLeft)}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* PAYPAL */}
                {payMethod === "PayPal" && paypalClientId && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 font-medium">
                      Giá trị đơn hàng sẽ được quy đổi tương đương sang USD theo
                      tỷ giá hiện tại.
                    </div>

                    {/* ✅ Countdown cho PayPal */}
                    {countdownActive && (
                      <div
                        className={`w-full p-3.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                          timeLeft <= 30
                            ? "bg-red-50 border-red-100 text-red-600"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>
                          Hoàn tất thanh toán trong:{" "}
                          <span className="font-mono font-bold text-base">
                            {formatTime(timeLeft)}
                          </span>
                        </span>
                      </div>
                    )}

                    <PayPalScriptProvider
                      options={{
                        clientId: paypalClientId,
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
                        onInit={() => startCountdown()}
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
                          if (countdownRef.current)
                            clearInterval(countdownRef.current);
                          setCountdownActive(false);
                          localStorage.setItem(
                            "payment_meta",
                            JSON.stringify({
                              paypalOrderId: data.orderID,
                              method: "PayPal",
                            }),
                          );
                          await handleCreateOrder(data.orderID);
                        }}
                        onError={() =>
                          toast.error("PayPal gặp sự cố, vui lòng thử lại.")
                        }
                      />
                    </PayPalScriptProvider>
                  </div>
                )}

                {payMethod === "PayPal" && !paypalClientId && (
                  <div className="p-6 text-center rounded-xl bg-red-50 border border-red-100">
                    <p className="text-sm text-red-500 font-semibold">
                      Lỗi cấu hình: Thiếu PayPal Client ID
                    </p>
                  </div>
                )}

                {/* COD loading */}
                {payMethod === "COD" && placing && (
                  <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                    <p className="text-sm font-medium">
                      Đang xử lý đơn hàng...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel */}
            <button
              disabled={placing || verifyingQR}
              onClick={handleCancelPayment}
              className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại và chọn phương thức khác
            </button>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div className="space-y-4 md:sticky md:top-6">
            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900">Giao đến</h3>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800 text-sm">
                  {selectedAddress?.receiver_name ||
                    selectedAddress?.receiverName}
                  <span className="text-gray-400 font-normal ml-2">
                    {selectedAddress?.receiver_phone ||
                      selectedAddress?.receiverPhone}
                  </span>
                </p>
                <p className="text-gray-500 leading-relaxed">
                  {selectedAddress?.address}, {selectedAddress?.ward},{" "}
                  {selectedAddress?.city}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Sản phẩm ({items.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-44 overflow-y-auto">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        x{item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 shrink-0">
                      {fmt(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Chi tiết thanh toán
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Phí ship</span>
                  <span
                    className={
                      shipping === 0 ? "text-emerald-600 font-medium" : ""
                    }
                  >
                    {shipping === 0 ? "Miễn phí" : fmt(shipping)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Giảm giá</span>
                    <span>-{fmt(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-gray-100">
                  <span className="font-bold text-gray-900 text-sm">
                    Tổng cộng
                  </span>
                  <span
                    className="font-black text-orange-600 text-xl"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    {fmt(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
