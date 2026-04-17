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
                <a href="/information/privacyPolicy" className="hover:text-[#6b4f3b]">Chính sách bảo mật</a>
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
                CHÍNH SÁCH BẢO MẬT
                </h1>
            </div>
        </div>

        <div className="max-w-5xl mx-auto text-lg py-30 text-[#3b1d14] font-serif leading-relaxed space-y-6">
            <p>
                Chính sách Bảo mật này mô tả cách <span className="font-bold text-[#a67c2d]">Choco Kingdom</span> thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn khi bạn truy cập hoặc thực hiện mua hàng từ website của chúng tôi.
            </p>
            <div>
                <h2 className="text-xl font-bold mb-3">
                    1. Thông Tin Cá Nhân Chúng Tôi Thu Thập
                </h2>
                <ul className="pl-5 space-y-2">
                    <li>
                    Khi bạn truy cập Website, chúng tôi sẽ tự động thu thập một số thông tin về thiết bị của bạn, bao gồm thông tin về trình duyệt web, địa chỉ IP, múi giờ và một số cookie được cài đặt trên thiết bị. Ngoài ra, khi bạn lướt xem Website, chúng tôi thu thập thông tin về các trang web hoặc sản phẩm cụ thể mà bạn xem, các thuật ngữ tìm kiếm đã dẫn bạn đến Website và cách bạn tương tác với chúng tôi. Chúng tôi gọi đây là <span className="font-bold text-[#6b4f3b]">"Thông tin Thiết bị"</span>.
                    </li>
                    <li>
                    Chúng tôi thu thập Thông tin Thiết bị bằng các công nghệ sau:
                    </li>
                    <ul className="pl-5 space-y-2">
                        <li>
                        <span className="font-bold text-[#6b4f3b]">Cookies:</span> Các tệp dữ liệu được đặt trên thiết bị hoặc máy tính của bạn và thường bao gồm một mã định danh ẩn danh duy nhất.
                        </li>
                        <li>
                        <span className="font-bold text-[#6b4f3b]">Tệp nhật ký (Log files):</span> Theo dõi các hành động xảy ra trên Website và thu thập dữ liệu bao gồm địa chỉ IP, loại trình duyệt, nhà cung cấp dịch vụ Internet, trang tham chiếu/thoát và dấu thời gian.
                        </li>
                        <li>
                        <span className="font-bold text-[#6b4f3b]">Web beacons, tags, pixels:</span> Các tệp điện tử được sử dụng để ghi lại thông tin về cách bạn duyệt Website.
                        </li>
                    </ul>
                    <li>Ngoài ra, khi bạn thực hiện mua hàng hoặc cố gắng thực hiện mua hàng qua Website, chúng tôi thu thập một số thông tin nhất định từ bạn, bao gồm: <span className="font-bold text-[#6b4f3b]">Họ tên, địa chỉ thanh toán, địa chỉ giao hàng, thông tin thanh toán, địa chỉ email và số điện thoại</span>. Chúng tôi gọi đây là <span className="font-bold text-[#6b4f3b]">"Thông tin Đơn hàng"</span>.</li>
                </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                2. Cách Chúng Tôi Sử Dụng Thông Tin Cá Nhân
            </h2>
            <ul className="pl-5 space-y-2">
                <li>Chúng tôi sử dụng Thông tin Đơn hàng để thực hiện các đơn hàng được đặt qua Website, bao gồm:</li>
                <ul className="pl-5 space-y-2">
                    <li>Xử lý thông tin thanh toán và sắp xếp vận chuyển.</li>
                    <li>Cung cấp hóa đơn và/hoặc xác nhận đơn hàng cho bạn.</li>
                    <li>Liên lạc với bạn để cập nhật trạng thái đơn hàng hoặc giải quyết sự cố.</li>
                    <li>Sàng lọc các đơn hàng để hạn chế rủi ro tiềm ẩn hoặc gian lận.</li>
                    <li>Gửi cho bạn thông tin hoặc quảng cáo liên quan đến sản phẩm/dịch vụ của chúng tôi dựa trên sở thích mà bạn đã chia sẻ.</li>
                </ul>
                <li>Chúng tôi sử dụng Thông tin Thiết bị để giúp chúng tôi cải thiện và tối ưu hóa Website (ví dụ: bằng cách tạo số liệu phân tích về cách khách hàng duyệt và tương tác với Website, đánh giá sự thành công của các chiến dịch marketing).</li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                3. Chia Sẻ Thông Tin Cá Nhân
            </h2>
            <ul className="pl-5 space-y-2">
                <li>Chúng tôi chia sẻ Thông tin Cá Nhân của bạn với các bên thứ ba để giúp chúng tôi vận hành Website như đã mô tả ở trên. Ví dụ:</li>
                <ul className="pl-5 space-y-2">
                    <li>Chúng tôi sử dụng nền tảng quản lý website để vận hành cửa hàng trực tuyến.</li>
                    <li>Chúng tôi sử dụng Google Analytics để giúp chúng tôi hiểu cách khách hàng sử dụng Website.</li>
                    <li>Cuối cùng, chúng tôi cũng có thể chia sẻ Thông tin Cá Nhân của bạn để tuân thủ các luật và quy định hiện hành, hoặc để phản hồi các yêu cầu hợp pháp từ cơ quan nhà nước.</li>
                </ul>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                4. Quảng Cáo Hành Vi
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Như đã mô tả ở trên, chúng tôi sử dụng Thông tin Cá Nhân của bạn để cung cấp cho bạn các quảng cáo mục tiêu hoặc các thông điệp marketing mà chúng tôi tin rằng bạn sẽ quan tâm qua Facebook, Google hoặc Email Marketing.
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                5. Lưu Trữ Dữ Liệu
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Khi bạn đặt hàng qua Website, chúng tôi sẽ duy trì Thông tin Đơn hàng của bạn trong hồ sơ của chúng tôi trừ khi và cho đến khi bạn yêu cầu chúng tôi xóa thông tin này.
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                6. Quyền Của Bạn
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Theo quy định pháp luật Việt Nam, bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân mà chúng tôi lưu giữ về bạn. Nếu bạn muốn thực hiện quyền này, vui lòng liên hệ với chúng tôi qua thông tin liên lạc bên dưới.
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                7. Thay Đổi
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian để phản ánh những thay đổi trong cách vận hành hoặc vì các lý do pháp lý và quy định khác.
                </li>
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