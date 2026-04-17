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
                <a href="/information/shippingPolicy" className="hover:text-[#6b4f3b]">Chính sách vận chuyển</a>
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
                CHÍNH SÁCH VẬN CHUYỂN
                </h1>
            </div>
        </div>

        <div className="max-w-5xl mx-auto text-lg py-30 text-[#3b1d14] font-serif leading-relaxed space-y-6">
            <p>
                Chào mừng bạn đến với vương quốc đồ ngọt <span className="font-bold text-[#a67c2d]">Choco Kingdom</span>. Để đảm bảo những chiếc bánh kem tươi mới, socola tan chảy và các loại bánh kẹo giữ nguyên hình dáng hoàn hảo khi đến tay bạn, chúng tôi áp dụng chính sách giao hàng riêng biệt cho khu vực <span className="font-bold text-[#6b4f3b]">TP.HCM</span>
            </p>
            <div>
                <h2 className="text-xl font-bold mb-3">
                1. Phạm Vi & Hình Thức Giao Hàng
                </h2>
                <ul className="pl-5 space-y-2">
                <li><span className="font-bold text-[#6b4f3b]">Khu vực phục vụ:</span> Chúng tôi chỉ nhận giao hàng trong nội thành và các huyện thuộc <span className="font-bold text-[#6b4f3b]">TP.HCM</span>.</li>
                <li><span className="font-bold text-[#6b4f3b]">Hình thức vận chuyển:</span>
                    <ul className="pl-5 space-y-2">
                        <li><span className="font-bold text-[#6b4f3b]">Bánh kem & Đồ ngọt dễ vỡ:</span> Giao bằng đội ngũ shipper riêng hoặc xe ô tô để đảm bảo bánh không bị rung lắc, nghiêng đổ.</li>
                        <li><span className="font-bold text-[#6b4f3b]">Socola & Bánh kẹo đóng gói:</span> Giao hỏa tốc bằng túi giữ nhiệt chuyên dụng.</li>
                    </ul>
                </li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    2. Thời Gian Xử Lý Đơn Hàng
                </h2>
                <ul className="pl-5 space-y-2">
                    <li><span className="font-bold text-[#6b4f3b]">Bánh kẹo có sẵn:</span> Giao trong vòng 2–4 giờ sau khi xác nhận đơn hàng (trong giờ làm việc).</li>
                    <li><span className="font-bold text-[#6b4f3b]">Bánh kem thiết kế riêng:</span> Vui lòng đặt trước ít nhất <span className="font-bold text-[#6b4f3b]">24–48 giờ</span> để chúng tôi chuẩn bị nguyên liệu tươi mới nhất.</li>
                    <li><span className="font-bold text-[#6b4f3b]">Giờ giao hàng:</span> Từ 8:00 đến 20:00 tất cả các ngày trong tuần (bao gồm cả Thứ Bảy và Chủ Nhật).</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    3. Phí Vận Chuyển
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>Phí giao hàng được tính dựa trên khoảng cách từ cửa hàng đến địa chỉ của bạn:</li>
                    <ul className="pl-5 space-y-2">
                        <li><span className="font-bold text-[#6b4f3b]">Quận Nội Thành :</span> Giá vận chuyển giao động từ 20.000đ - 35.000đ.</li>
                        <li><span className="font-bold text-[#6b4f3b]">Quận/Huyện Ngoại Thành:</span> Tính theo biểu phí thực tế của ứng dụng giao hàng (Ahamove/Grab).</li>
                        <li><span className="font-bold text-[#6b4f3b]">Ưu đãi Freeship:</span> Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên</li>
                    </ul>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    4. Quy Định Nhận Hàng & Kiểm Tra (Quan Trọng)
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>Do tính chất đặc thù của bánh kem và đồ ngọt:</li>
                    <ul className="pl-5 space-y-2">
                        <li><span className="font-bold text-[#6b4f3b]">Kiểm tra tại chỗ:</span> Quý khách vui lòng mở hộp và kiểm tra hình thức bánh ngay khi nhận hàng từ shipper.</li>
                        <li><span className="font-bold text-[#6b4f3b]">Trách nhiệm:</span> Nếu bánh bị biến dạng, đổ vỡ do quá trình vận chuyển, vui lòng từ chối nhận và báo ngay cho Hotline để được đổi sản phẩm mới. Chúng tôi không giải quyết các khiếu nại về hình thức sau khi shipper đã rời đi.</li>
                        <li><span className="font-bold text-[#6b4f3b]">Lưu ý bảo quản:</span> Sau khi nhận bánh kem hoặc socola, vui lòng bảo quản ngay vào ngăn mát tủ lạnh để duy trì chất lượng tốt nhất.</li>
                    </ul>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    5. Thay Đổi & Huỷ Đơn
                </h2>
                <ul className="pl-5 space-y-2">
                    <li><span className="font-bold text-[#6b4f3b]">Bánh kem:</span> Không hỗ trợ huỷ đơn sau khi bánh đã vào giai đoạn trang trí (thường là 4 tiếng trước giờ giao).</li>
                    <li><span className="font-bold text-[#6b4f3b]">Thay đổi địa chỉ:</span> Vui lòng thông báo ít nhất 2 tiếng trước giờ giao dự kiến để chúng tôi điều phối shipper.</li>
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-3">
                    Liên Hệ Choco Kingdom
                </h2>
                <ul className="pl-5 space-y-2">
                    <li><span className="font-bold text-[#6b4f3b]">Hotline/Zalo đặt bánh:</span> ...........  </li>
                    <li><span className="font-bold text-[#6b4f3b]">Facebook/Instagram:</span> Choco Kingdom - Sweet Paradise</li>
                    <li><span className="font-bold text-[#6b4f3b]">Email:</span> contact@chocokindom.com</li>
                </ul>
            </div>
        </div>
    </div>
    );
}