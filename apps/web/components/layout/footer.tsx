import React from 'react'
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#3b1d14]">

      <div className="text-center pt-4 pb-10">
          <h1 className="text-5xl font-serif">
              <span className="text-[#e7c27d]">Choco Kingdom</span>
          </h1>
      </div>

      <div className="max-w-6xl text-white/70 mx-auto grid md:grid-cols-4 gap-10 px-6 pb-12 font-sans ">
        <div>
          <h3 className="text-base text-[#a67c2d] font-serif font-bold mb-4 border-b border-white/30 pb-2">
            Sản phẩm của chúng tôi
          </h3>
          <ul className="space-y-2 text-base">
            <li className="hover:text-[#e7c27d] cursor-pointer">Sô cô la</li>
            <li className="hover:text-[#e7c27d] cursor-pointer">Kẹo</li>
            <li className="hover:text-[#e7c27d] cursor-pointer">Bánh quy</li>
            <li className="hover:text-[#e7c27d] cursor-pointer">Hộp snack</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base text-[#a67c2d] font-serif font-bold mb-4 border-b border-white/30 pb-2">
            Bạn có câu hỏi?
          </h3>
          <ul className="space-y-2 text-base">
            <li className="hover:text-[#e7c27d] cursor-pointer">Câu hỏi thường gặp</li>
            <li className="hover:text-[#e7c27d] cursor-pointer">Liên hệ chúng tôi</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base text-[#a67c2d] font-serif font-bold mb-4 border-b border-white/30 pb-2">
            Thông tin
          </h3>
          <ul className="space-y-2 text-base">
            <li className="hover:text-[#e7c27d] cursor-pointer">
              <Link href="/information/aboutUs">Về chúng tôi</Link>
            </li>
            <li className="hover:text-[#e7c27d] cursor-pointer">
              <Link href="/information/shippingPolicy">Chính sách vận chuyển</Link>
            </li>
            <li className="hover:text-[#e7c27d] cursor-pointer">
              <Link href="/information/privacyPolicy">Chính sách bảo mật</Link>
            </li>
            <li className="hover:text-[#e7c27d] cursor-pointer">
              <Link href="/information/returnsPolicy">Chính sách đổi trả</Link>
            </li>
            <li className="hover:text-[#e7c27d] cursor-pointer">
              <Link href="/information/termsOfUse">Điều khoản sử dụng</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-base text-[#a67c2d] font-serif font-bold mb-4 border-b border-white/30 pb-2">
            Theo dõi chúng tôi
          </h3>

          <div className="space-y-3 text-base">
            <div className="flex items-center gap-2 hover:text-[#e7c27d] cursor-pointer">
              <img src="/image/facebook.png" className="w-5 h-5" />
              <span>Facebook</span>
            </div>

            <div className="flex items-center gap-2 hover:text-[#e7c27d] cursor-pointer">
              <img src="/image/instagram.png" className="w-5 h-5" />
              <span>Instagram</span>
            </div>

            <div className="flex items-center gap-2 hover:text-[#e7c27d] cursor-pointer">
              <img src="/image/youtube.png" className="w-5 h-5" />
              <span>YouTube</span>
            </div>
          </div>
        </div>

      </div>

      <div className="text-center text-lg text-white/70 py-4 border-t border-white/30">
        © 2026 Choco Kingdom. Bản quyền đã được bảo lưu.
      </div>

    </footer>
  );
}