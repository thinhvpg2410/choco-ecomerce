import React from 'react'
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r bg-purple-200 mt-20">

      <div className="text-center pt-4 pb-10">
          <h1 className="text-5xl font-extrabold">
              <span className="text-blue-500">Choco</span>{" "}
              <span className="text-pink-500">Kingdom</span>
          </h1>
      </div>

      <div className="max-w-6xl text-gray-700 mx-auto grid md:grid-cols-4 gap-10 px-6 pb-12">

        <div>
          <h3 className="text-xl text-blue-700 font-bold mb-4 border-b border-white/30 pb-2">
            Our Products
          </h3>
          <ul className="space-y-2 text-lg">
            <li className="hover:text-pink-700 cursor-pointer">Chocolates</li>
            <li className="hover:text-pink-700 cursor-pointer">Candies</li>
            <li className="hover:text-pink-700 cursor-pointer">Cookies</li>
            <li className="hover:text-pink-700 cursor-pointer">Snack Boxes</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl text-blue-700 font-semibold mb-4 border-b border-white/30 pb-2">
            Have a question?
          </h3>
          <ul className="space-y-2 text-lg">
            <li className="hover:text-pink-700 cursor-pointer">FAQs</li>
            <li className="hover:text-pink-700 cursor-pointer">Contact Us</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl text-blue-700 font-semibold mb-4 border-b border-white/30 pb-2">
            Information
          </h3>
          <ul className="space-y-2 text-lg">
            <li className="hover:text-pink-700 cursor-pointer">
              <Link href="/information/aboutUs">About Us</Link>
            </li>
            <li className="hover:text-pink-700 cursor-pointer">
              <Link href="/information/shippingPolicy">Shipping Policy</Link>
            </li>
            <li className="hover:text-pink-700 cursor-pointer">
              <Link href="/information/privacyPolicy">Privacy Policy</Link>
            </li>
            <li className="hover:text-pink-700 cursor-pointer">
              <Link href="/information/returnsPolicy">Returns Policy</Link>
            </li>
            <li className="hover:text-pink-700 cursor-pointer">
              <Link href="/information/termsOfUse">Terms of Use</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl text-blue-700 font-semibold mb-4 border-b border-white/30 pb-2">
            Follow us
          </h3>

          <div className="space-y-3 text-lg">
            <div className="flex items-center gap-2 hover:text-pink-700 cursor-pointer">
              <img src="/image/facebook.png" className="w-5 h-5" />
              <span>Facebook</span>
            </div>

            <div className="flex items-center gap-2 hover:text-pink-700 cursor-pointer">
              <img src="/image/instagram.png" className="w-5 h-5" />
              <span>Instagram</span>
            </div>

            <div className="flex items-center gap-2 hover:text-pink-700 cursor-pointer">
              <img src="/image/youtube.png" className="w-5 h-5" />
              <span>YouTube</span>
            </div>
          </div>
        </div>

      </div>

      <div className="text-center text-lg from-blue-500 to-pink-500 py-4 border-t border-white/30">
        © 2026 Choco Kingdom. All rights reserved.
      </div>

    </footer>
  );
}