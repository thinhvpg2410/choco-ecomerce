import React from "react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"

export default function AboutPage() {
return (
    <div>
        <div className="px-6 py-3 bg-[#f5efe6]">
        {/* Breadcrumb */}
            <div className="w-full mx-auto py-2 text-base text-[#3b1d14] flex items-center gap-2 font-serif">
                <a href="/" className="flex items-center">
                    <img src="/image/home.png" alt="home" className="w-5 h-5"/>
                </a>
                <span>›</span>
                <a href="/information/aboutUs" className="hover:text-[#6b4f3b]">Giới thiệu</a>
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
                CHOCO KINGDOM
                </h1>
            </div>
        </div>
        <div className="p-10 bg-gray-50 ">
            <div className="bg-white flex items-center justify-center rounded-lg shadow-md p-8 w-full">
                <Accordion type="single" collapsible className="w-full space-y-4 text-[#3b1d14]">
                    <AccordionItem value="company">
                        <AccordionTrigger>VỀ CÔNG TY</AccordionTrigger>
                        <AccordionContent className="font-bold">
                            Câu Chuyện Của Chúng Tôi
                        </AccordionContent>
                        <AccordionContent>
                            Khởi nguồn từ niềm đam mê bất tận với nghệ thuật làm bánh và socola thủ công, <span className="font-bold text-[#a67c2d]">Choco Kingdom</span> ra đời tại lòng thành phố Hồ Chí Minh với sứ mệnh mang đến "hương vị hạnh phúc" trong từng sản phẩm. Chúng tôi tin rằng, mỗi chiếc bánh kem hay một viên socola nhỏ bé đều chứa đựng sức mạnh kỳ diệu để kết nối cảm xúc, chia sẻ yêu thương và làm bừng sáng những khoảnh khắc đời thường.
                        </AccordionContent>
                        <AccordionContent className="font-bold">
                            Chúng Tôi Có Gì?
                        </AccordionContent>
                        <AccordionContent>
                            Tại vương quốc của <span className="font-bold text-[#a67c2d]">Choco Kingdom</span>, bạn sẽ tìm thấy một thế giới đồ ngọt đa dạng, được chăm chút tỉ mỉ:
                            <ul className="pl-5 space-y-2">
                                <li> <span className="font-bold text-[#6b4f3b] ">Socola Thủ Công:</span> Từ những thanh socola nguyên bản đậm đà đến các dòng mix vị hiện đại, đầy sáng tạo.</li>
                                <li><span className="font-bold text-[#6b4f3b]">Bánh Kem Nghệ Thuật:</span> Những chiếc bánh kem tươi mới mỗi ngày, được thiết kế riêng cho các dịp sinh nhật, kỷ niệm và sự kiện đặc biệt</li>
                                <li><span className="font-bold text-[#6b4f3b]">Thế Giới Bánh Kẹo:</span> Tuyển tập các loại bánh kẹo, đồ ngọt được chọn lọc kỹ lưỡng, đảm bảo tiêu chuẩn về cả hương vị lẫn thẩm mỹ.</li>
                            </ul>
                        </AccordionContent>
                        <AccordionContent className="font-bold">
                            Giá Trị Cốt Lõi
                        </AccordionContent>
                        <AccordionContent>
                            <ul className="pl-5 space-y-2">
                                <li> <span className="font-bold text-[#6b4f3b]">Chất Lượng Thượng Hạng:</span> Chúng tôi khắt khe trong việc lựa chọn nguyên liệu, ưu tiên nguồn gốc tự nhiên và đảm bảo an toàn vệ sinh thực phẩm tuyệt đối.</li>
                                <li><span className="font-bold text-[#6b4f3b]">Sáng Tạo Không Ngừng:</span> Đội ngũ nghệ nhân của Choco Kingdom luôn cập nhật những xu hướng đồ ngọt mới nhất để mang đến sự bất ngờ cho khách hàng.</li>
                                <li><span className="font-bold text-[#6b4f3b]">Tận Tâm Phục Vụ:</span> Với chúng tôi, khách hàng không chỉ mua một món ăn, mà là đang trao gửi niềm tin. Choco Kingdom cam kết dịch vụ giao hàng nội thành TP.HCM nhanh chóng, bảo quản chuyên nghiệp để sản phẩm luôn hoàn hảo khi đến tay bạn.</li>
                            </ul>
                        </AccordionContent>
                        <AccordionContent>
                            Choco Kingdom không chỉ là nơi để mua đồ ngọt, mà còn là một
                            <span className="font-bold text-[#a67c2d]">{" "}“Vương quốc ngọt ngào”</span>{" "}
                            nơi mọi người có thể tìm thấy niềm vui trong từng món nhỏ.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="vision">
                        <AccordionTrigger>TẦM NHÌN</AccordionTrigger>
                        <AccordionContent>
                            <ul className="pl-5 space-y-2">
                                <li>
                                    <span className="font-bold">1. Trở thành biểu tượng quà tặng ngọt ngào tại TP.HCM</span> 
                                    <p>Choco Kingdom định hướng trở thành thương hiệu hàng đầu và lựa chọn tiên quyết của khách hàng tại TP. Hồ Chí Minh khi nghĩ đến các sản phẩm quà tặng từ socola, bánh kem và đồ ngọt cao cấp. Chúng tôi không chỉ bán bánh, chúng tôi bán giải pháp cho những dịp kỷ niệm ý nghĩa.</p>
                                </li>
                                <li>
                                    <span className="font-bold">2. Định nghĩa lại trải nghiệm "Đồ ngọt thủ công"</span>
                                    <p>Chúng tôi tầm nhìn về một tương lai nơi mỗi khách hàng đều có thể tiếp cận với những sản phẩm đồ ngọt chất lượng chuẩn quốc tế ngay tại địa phương. Choco Kingdom cam kết dẫn đầu trong việc kết hợp kỹ thuật làm bánh hiện đại với những nguyên liệu đặc sản, tạo nên bản sắc riêng biệt "Made in Saigon".</p>
                                </li>
                                <li>
                                    <span className="font-bold">3. Xây dựng hệ sinh thái dịch vụ hoàn hảo</span>
                                    <p>Tầm nhìn của chúng tôi là tối ưu hóa quy trình từ sản xuất đến giao nhận hỏa tốc trong nội thành, đảm bảo mọi sản phẩm nhạy cảm nhất như bánh kem hay socola tươi đều giữ nguyên độ hoàn hảo 100% khi đến tay khách hàng.</p>
                                </li>
                                <li>
                                    <span className="font-bold">4. Lan tỏa văn hóa "Thưởng thức hạnh phúc"</span>
                                    <p>Choco Kingdom mong muốn xây dựng một cộng đồng yêu đồ ngọt, nơi sự sáng tạo và niềm vui được lan tỏa. Chúng tôi tin rằng trong tương lai, cái tên Choco Kingdom sẽ đồng nghĩa với những khoảnh khắc hạnh phúc và ngọt ngào nhất trong cuộc sống của mỗi gia đình Việt.</p>
                                </li>
                                <span className="italic">Tầm nhìn của chúng tôi là biến mỗi đơn hàng thành một niềm vui bất ngờ, và mỗi khách hàng trở thành một thành viên trong vương quốc của Choco Kingdom.</span>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="mission">
                        <AccordionTrigger>SỨ MỆNH</AccordionTrigger>
                        <AccordionContent>
                            Tại <span className="font-bold text-[#a67c2d]">Choco Kingdom</span>, sứ mệnh của chúng tôi gói gọn trong 3 trụ cột chính:
                            <ul className="pl-5 space-y-2">
                                <li>
                                    <span className="font-bold">1. Gói trọn yêu thương trong từng sản phẩm </span> 
                                    <p>Sứ mệnh cao cả nhất của chúng tôi là trở thành "người đưa tin" cho những cảm xúc ngọt ngào. Choco Kingdom cam kết mỗi chiếc bánh kem, mỗi viên socola xuất kho đều được làm ra bằng sự tỉ mỉ, tâm huyết và tình yêu nghề, giúp khách hàng gửi gắm những lời chúc, lời cảm ơn và sự quan tâm đến người thân yêu một cách trọn vẹn nhất.</p>
                                </li>
                                <li>
                                    <span className="font-bold">2. Nâng tầm trải nghiệm ẩm thực nội thành</span>
                                    <p>Chúng tôi tầm nhìn về một tương lai nơi mỗi khách hàng đều có thể tiếp cận với những sản phẩm đồ ngọt chất lượng chuẩn quốc tế ngay tại địa phương. Choco Kingdom cam kết dẫn đầu trong việc kết hợp kỹ thuật làm bánh hiện đại với những nguyên liệu đặc sản, tạo nên bản sắc riêng biệt "Made in Saigon".</p>
                                </li>
                                <li>
                                    <span className="font-bold">3. Cam kết sự hoàn hảo từ xưởng bánh đến tay người nhận</span>
                                    <p>Tầm nhìn của chúng tôi là tối ưu hóa quy trình từ sản xuất đến giao nhận hỏa tốc trong nội thành, đảm bảo mọi sản phẩm nhạy cảm nhất như bánh kem hay socola tươi đều giữ nguyên độ hoàn hảo 100% khi đến tay khách hàng.</p>
                                </li>
                                <li>
                                    <span className="font-bold">Giá trị chúng tôi theo đuổi:</span>
                                    <ul className="pl-5 space-y-2">
                                        <li> <span className="font-bold text-[#6b4f3b]">Tươi mới:</span> Sản xuất trong ngày, giao ngay trong buổi.</li>
                                        <li> <span className="font-bold text-[#6b4f3b]">An toàn:</span> Tuyệt đối tuân thủ các quy chuẩn vệ sinh an toàn thực phẩm.</li>
                                        <li> <span className="font-bold text-[#6b4f3b]">Sáng tạo:</span> Không ngừng đổi mới mẫu mã và hương vị để dẫn đầu xu hướng.</li>
                                    </ul>
                                </li>
                                <span className="italic">"Sứ mệnh của chúng tôi là biến thế giới trở nên ngọt ngào hơn, bắt đầu từ những nụ cười của khách hàng tại TP. Hồ Chí Minh."</span>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="businessEthics">
                        <AccordionTrigger>ĐẠO ĐỨC KINH DOANH</AccordionTrigger>
                        <AccordionContent>
                            Chúng tôi cam kết vận hành doanh nghiệp dựa trên 5 trụ cột đạo đức cốt lõi:
                            <ul className="pl-5 space-y-2">
                                <li>
                                    <span className="font-bold text-[#6b4f3b]">1. Chính trực trong chất lượng</span> 
                                    <p>Chúng tôi tuyệt đối không thỏa hiệp về chất lượng nguyên liệu. Mỗi viên socola, mỗi ổ bánh kem đều được chế biến từ nguồn nguyên liệu sạch, có nguồn gốc rõ ràng và đảm bảo an toàn vệ sinh thực phẩm cao nhất. Choco Kingdom nói không với các chất bảo quản độc hại hoặc nguyên liệu kém chất lượng để tối ưu lợi nhuận.</p>
                                </li>
                                <li>
                                    <span className="font-bold text-[#6b4f3b]">2. Minh bạch với khách hàng</span> 
                                    <p>Mọi thông tin về sản phẩm, từ thành phần, hạn sử dụng đến chính sách vận chuyển và đổi trả đều được chúng tôi công khai rõ ràng. Chúng tôi cam kết hình ảnh quảng cáo và sản phẩm thực tế luôn đồng nhất, giúp khách hàng tại TP.HCM hoàn toàn yên tâm khi đặt hàng trực tuyến.</p>
                                </li>
                                <li>
                                    <span className="font-bold text-[#6b4f3b]">3. Trách nhiệm trong từng đơn hàng</span> 
                                    <p>Chúng tôi hiểu rằng bánh kem và đồ ngọt thường dành cho những dịp quan trọng. Vì vậy, Choco Kingdom luôn chịu trách nhiệm đến cùng đối với mỗi sản phẩm xuất kho. Nếu có bất kỳ sai sót nào xảy ra trong quá trình sản xuất hoặc vận chuyển nội thành, chúng tôi sẽ chủ động giải quyết nhanh chóng và thỏa đáng nhất cho khách hàng.</p>
                                </li>
                                <li>
                                    <span className="font-bold text-[#6b4f3b]">4. Tôn trọng và Công bằng</span> 
                                    <ul className="pl-5 space-y-2">
                                        <li><span>Với khách hàng:</span> Đối xử công bằng, lắng nghe mọi phản hồi và không phân biệt giá trị đơn hàng lớn hay nhỏ.</li>
                                        <li><span>Với đối tác vận chuyển:</span>Hợp tác dựa trên sự tôn trọng, đảm bảo quyền lợi cho các shipper hoạt động tại khu vực TP.HCM.</li>
                                    </ul>
                                </li>
                                <li>
                                    <span className="font-bold text-[#6b4f3b]">5. Phát triển bền vững và Cộng đồng</span>
                                    <p>Choco Kingdom nỗ lực giảm thiểu rác thải nhựa bằng cách sử dụng bao bì thân thiện với môi trường bất cứ khi nào có thể. Chúng tôi mong muốn đóng góp vào sự phát triển chung của cộng đồng ẩm thực tại TP. Hồ Chí Minh thông qua các hoạt động kinh doanh lành mạnh và có trách nhiệm.</p>
                                </li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    </div>
    );
}