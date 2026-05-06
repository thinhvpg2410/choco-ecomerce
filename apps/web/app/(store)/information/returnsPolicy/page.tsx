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
                <a href="/information/returnsPolicy" className="hover:text-[#6b4f3b]">Chính sách đổi trả</a>
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
                CHÍNH SÁCH ĐỔI TRẢ
                </h1>
            </div>
        </div>

        <div className="max-w-5xl mx-auto text-lg py-30 text-[#3b1d14] font-serif leading-relaxed space-y-6">
            <p>
                Tại <span className="font-bold text-[#a67c2d]">Choco Kingdom</span>, sức khỏe và sự hài lòng của khách hàng là ưu tiên hàng đầu. Do đặc thù sản phẩm là thực phẩm và đồ uống, chúng tôi áp dụng chính sách đổi trả nghiêm ngặt như sau:
            </p>
            <div>
            <h2 className="text-xl font-bold mb-3">
                1. Quy Định Chung Về Đổi Trả
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                <span className="font-bold text-[#6b4f3b]">Vấn đề vệ sinh & an toàn:</span> Vì lý do vệ sinh và an toàn thực phẩm, chúng tôi không chấp nhận trả lại bất kỳ sản phẩm nào khi bao bì đã bị mở hoặc niêm phong đã bị phá vỡ trong bất kỳ hoàn cảnh nào.
                </li>
                <li>
                <span className="font-bold text-[#6b4f3b]">Sản phẩm tùy chỉnh:</span> Các loại bánh kem đặt theo yêu cầu riêng (viết chữ, làm mẫu riêng) hoặc các gói quà tặng được mix riêng sẽ không được đổi trả hoặc hoàn tiền.
                </li>
                <li>
                <span className="font-bold text-[#6b4f3b]">Sở thích cá nhân:</span> Chúng tôi không giải quyết các yêu cầu hoàn tiền hoặc trả hàng vì lý do không hợp khẩu vị cá nhân (ví dụ: bạn cảm thấy bánh quá ngọt, không thích vị socola này, v.v.).
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                2. Quy Trình Trả Hàng (Đối với bưu kiện chưa mở)
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Nếu bạn muốn trả lại một kiện hàng còn nguyên vẹn, chưa mở, vui lòng liên hệ với chúng tôi qua email/zalo trong vòng 24 giờ kể từ khi nhận hàng.
                </li>
                <li>
                Kiện hàng phải được gửi trả về cửa hàng tại TP.HCM trong vòng 3 ngày kể từ ngày nhận.
                </li>
                <li>
                <span className="font-bold text-[#6b4f3b]">Chi phí vận chuyển:</span> Choco Kingdom không hỗ trợ chi phí vận chuyển cho việc trả hàng trong mọi trường hợp.
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                3. Chính Sách Hủy Đơn Hàng
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                    <span className="font-bold text-[#6b4f3b]">Thời gian hủy:</span> Bạn chỉ có thể hủy đơn hàng trong vòng <span className="font-bold text-[#6b4f3b]">1 giờ</span> kể từ khi đặt hàng. Sau thời gian này, quy trình chuẩn bị và đóng gói đã bắt đầu, đơn hàng sẽ không thể hủy.
                </li>
                <li>
                    <span className="font-bold text-[#6b4f3b]">Đối với bánh kem:</span> Đơn hàng bánh kem đặt trước không thể hủy nếu chúng tôi đã bắt đầu quá trình làm bánh hoặc trang trí.
                </li>
                <li>
                    <span className="font-bold text-[#6b4f3b]">Phí hoàn tiền:</span> Tất cả các đơn hàng hủy hoặc trả lại sẽ bị trừ <span className="font-bold text-[#6b4f3b]">10% phí giao dịch</span>. Đây là khoản phí mà đơn vị thanh toán thu và không hoàn lại cho cửa hàng khi thực hiện hoàn tiền.
                </li>
                <li>
                    <span className="font-bold text-[#6b4f3b]">Phí vận chuyển:</span> Đối với các đơn hàng đã xuất kho nhưng khách muốn trả lại, phí vận chuyển ban đầu sẽ không được hoàn lại.
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                4. Xử Lý Sự Cố (Hư hỏng do vận chuyển)
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Như đã nêu ở Chính sách Vận chuyển, đối với bánh kem và đồ ngọt dễ vỡ, quý khách vui lòng kiểm tra hàng ngay khi shipper giao đến.
                </li>
                <li>
                Nếu sản phẩm bị dập nát, hư hỏng nặng do lỗi vận chuyển, hãy chụp ảnh/quay video và báo ngay cho shipper/cửa hàng để được hỗ trợ gửi sản phẩm thay thế ngay lập tức.
                </li>
                <li>
                Chúng tôi không giải quyết các khiếu nại về hư hỏng hình thức sau khi quý khách đã ký nhận hàng và shipper rời đi.
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                5. Hàng Cận Date (Best Before)
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Chúng tôi không chấp nhận trả hàng hoặc hoàn tiền đối với các sản phẩm đã được thông báo rõ ràng là "Hàng cận date" hoặc nằm trong danh mục "Xả kho/Giảm giá mạnh".
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                6. Thời Gian Hoàn Tiền
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Sau khi chúng tôi xác nhận đồng ý hoàn tiền, số tiền sẽ được chuyển về tài khoản của bạn trong vòng 7–14 ngày làm việc tùy theo quy trình của ngân hàng. Đây là quy định chung của hệ thống ngân hàng mà chúng tôi không thể can thiệp nhanh hơn.
                </li>
            </ul>
            </div>

            <div>
            <h2 className="text-xl font-bold mb-3">
                Liên Hệ Hỗ Trợ
            </h2>
            <ul className="pl-5 space-y-2">
                <li>
                Nếu có bất kỳ vấn đề thực tế nào xảy ra với đơn hàng của bạn, đừng ngần ngại liên hệ với chúng tôi để được giải quyết một cách chân thành nhất:
                </li>
                <ul className="pl-5 space-y-2">
                    <li><span className="font-bold text-[#6b4f3b]">Hotline/Zalo đặt bánh:</span> ...........  </li>
                    <li><span className="font-bold text-[#6b4f3b]">Facebook/Instagram:</span> Choco Kingdom - Sweet Paradise</li>
                    <li><span className="font-bold text-[#6b4f3b]">Email:</span> contact@chocokindom.com</li>
                </ul>
            </ul>
            </div>
        </div>
    </div>
    );
}