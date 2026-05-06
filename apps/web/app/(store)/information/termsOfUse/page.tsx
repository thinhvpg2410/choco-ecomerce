export default function ShippingPolicy() {
return (
    <div>
        <div className="px-6 py-3 bg-[#f5efe6]">
        {/* Breadcrumb */}
            <div className="w-full mx-auto py-2 text-base text-[#3b1d14] flex items-center gap-2 font-serif">
                <a href="/" className="flex items-center">
                    <img src="/image/home.png" alt="home" className="w-5 h-5"/>
                </a>
                <span>› Chính sách </span>
                <span>›</span>
                <a href="/information/termsOfUse" className="hover:text-[#6b4f3b]">Điều khoản sử dụng</a>
            </div>

            {/* Banner */}
            <div className="relative overflow-hidden rounded-sm">
                <img
                src="/image/bg.jpeg"
                alt="privacy"
                className="w-full h-[300px] object-cover"
                />
                <div className="absolute inset-0 bg-[#3b1d14]/60"></div>
                <div className="absolute inset-4 border border-[#e7c27d] pointer-events-none"></div>
                <h1 className="absolute inset-0 flex items-center justify-center 
                            font-serif text-[#e7c27d] text-5xl tracking-widest uppercase">
                ĐIỀU KHOẢN SỬ DỤNG
                </h1>
            </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto text-lg py-30 text-[#3b1d14] font-serif leading-relaxed space-y-6">
            <p>
                Chào mừng bạn đến với trang hỗ trợ khách hàng của <span className="font-bold text-[#a67c2d]">Choco Kingdom</span>. Dưới đây là những giải đáp cho các thắc mắc phổ biến khi bạn trải nghiệm mua sắm tại "Vương quốc đồ ngọt" của chúng tôi.
            </p>
            <div>
                <h2 className="text-xl font-bold mb-3">
                    1. Sản phẩm hết hàng có được nhập về lại không?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>
                    Nếu một món đồ ngọt nào đó bạn yêu thích đang tạm hết hàng, đừng lo lắng, chúng tôi sẽ sớm bổ sung! Cách tốt nhất để cập nhật thông tin nhập hàng mới là theo dõi <span className="font-bold text-[#6b4f3b]">Fanpage Facebook/Instagram</span> hoặc đăng ký nhận thông báo qua email của chúng tôi
                    </li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    2. Các gói bánh kẹo mix có luôn giống nhau không?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>
                    Sự đa dạng trong các gói mix (tổng hợp) có thể thay đổi tùy thuộc vào lượng hàng tồn kho và các loại bánh kẹo mới về.
                    </li>
                    <li>
                    Trong một vài trường hợp hy hữu, nếu một loại kẹo trong gói mix hết hàng, chúng tôi sẽ thay thế bằng một loại có hương vị tương đương hoặc tăng số lượng của các loại kẹo còn lại để đảm bảo bạn vẫn nhận được một túi bánh kẹo đầy đặn và thơm ngon nhất.
                    </li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    3. Làm thế nào để đặt hàng?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>Chọn sản phẩm bạn yêu thích và nhấn <span className="font-bold text-[#6b4f3b]">"Thêm vào giỏ hàng"</span>.</li>
                    <li>Khi đã sẵn sàng, hãy nhấn nút  <span className="font-bold text-[#6b4f3b]">"Thanh toán"</span> tại giỏ hàng.</li>
                    <li>Nhập thông tin giao hàng chính xác (đặc biệt là số điện thoại và địa chỉ tại TP.HCM).</li>
                    <li>Chọn phương thức vận chuyển và thanh toán để hoàn tất đơn hàng.</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    4. Choco Kingdom chấp nhận các phương thức thanh toán nào?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>Chúng tôi chấp nhận đa dạng hình thức thanh toán để thuận tiện cho bạn:</li>
                    <ul className="pl-5 space-y-2">
                        <li>Chuyển khoản ngân hàng (Banking).</li>
                        <li>Thẻ tín dụng/ghi nợ (Visa, Mastercard).</li>
                        <li>Ví điện tử (Momo, ZaloPay).</li>
                        <li>
                        <span className="font-bold text-[#6b4f3b]">Thanh toán khi nhận hàng (COD):</span> Áp dụng cho đơn hàng bánh kẹo có sẵn (không áp dụng cho bánh kem thiết kế riêng giá trị cao).
                        </li>
                    </ul>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    5. Tôi có thể thay đổi đơn hàng sau khi đặt không?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>
                    Nếu bạn muốn thay đổi số lượng hoặc loại sản phẩm, vui lòng liên hệ ngay với chúng tôi qua Hotline/Zalo hoặc Email.
                    </li>
                    <li>
                    <span className="font-bold text-[#6b4f3b]">Lưu ý:</span> Đối với bánh kem hoặc sản phẩm đã vào quy trình đóng gói/giao hàng, việc thay đổi có thể không thực hiện được.
                    </li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    6. Tôi gặp vấn đề với đơn hàng (thiếu hàng/sai hàng/hàng hư hỏng), tôi phải làm gì?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>Hãy liên hệ với đội ngũ chăm sóc khách hàng của chúng tôi trong vòng 2 ngày kể từ khi nhận hàng.</li>
                    <ul className="pl-5 space-y-2">
                        <li> <span className="font-bold text-[#6b4f3b]">Yêu cầu:</span> Bạn cần cung cấp hình ảnh/video mở hộp, hình ảnh hóa đơn và tình trạng thực tế của sản phẩm.</li>
                        <li><span className="font-bold text-[#6b4f3b]">Lưu ý quan trọng:</span> Hình ảnh phải thể hiện sản phẩm ngay khi vừa nhận. Nếu sản phẩm đã bị mở bao bì, đã ăn hoặc uống một phần, chúng tôi rất tiếc không thể chấp nhận đó là bằng chứng xác thực để giải quyết khiếu nại.</li>
                    </ul>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    7. Nếu sản phẩm trong gói "Tự thiết kế" hết hàng thì sao?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>
                    Chúng tôi luôn cố gắng duy trì kho hàng đầy đủ. Tuy nhiên, nếu có sự cố ngoài ý muốn từ nhà cung cấp:
                    </li>
                    <ul className="pl-5 space-y-2">
                        <li>Chúng tôi sẽ chủ động bù thêm các loại bánh kẹo khác mà bạn đã chọn trong cùng danh sách để đảm bảo đủ trọng lượng bạn đã thanh toán.</li>
                        <li>Đối với các yêu cầu đặc biệt hoặc bánh kem, chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để chọn phương án thay thế. Nếu không nhận được phản hồi, chúng tôi sẽ chọn loại tương đương nhất để không làm chậm trễ thời gian giao hàng của bạn.</li>
                    </ul>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    Bạn còn câu hỏi khác?
                </h2>
                <ul className="pl-5 space-y-2">
                    <li><span className="pl-5 font-bold text-[#6b4f3b]">Hotline/Zalo đặt bánh:</span> ...........  </li>
                    <li><span className="pl-5 font-bold text-[#6b4f3b]">Facebook/Instagram:</span> Choco Kingdom - Sweet Paradise</li>
                    <li><span className="pl-5 font-bold text-[#6b4f3b]">Email:</span> contact@chocokindom.com</li>
                </ul>
            </div>
        </div>
    </div>
    );
}