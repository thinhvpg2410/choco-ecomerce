"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProductCardHorizontal, ChatProduct } from "@/components/product/product-card";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[]; 
}

const QUICK_REPLIES = [
  { label: "🆕 Sản phẩm mới", text: "Có sản phẩm mới nào không?" },
  { label: "🔥 Bán chạy", text: "Sản phẩm bán chạy nhất là gì?" },
  { label: "⭐ Nổi bật", text: "Sản phẩm nổi bật của shop?" },
  { label: "🏷️ Khuyến mãi", text: "Có sản phẩm nào đang giảm giá không?" },
];

const BotAvatar = () => (
  <div
    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
    style={{ background: "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)" }}
  >
    <span style={{ fontSize: 14 }}>🤖</span>
  </div>
);

const TypingDots = () => (
  <div className="flex gap-1.5 items-center">
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="w-1.5 h-1.5 rounded-full inline-block animate-bounce"
        style={{
          background: "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)",
          animationDelay: `${delay}ms`,
        }}
      />
    ))}
  </div>
);

function parseProductsFromReply(raw: string): {
  text: string;
  products: ChatProduct[];
} {
  const FENCE_RE = /<!--PRODUCTS_JSON\s*([\s\S]*?)\s*-->/i;
  const match = raw.match(FENCE_RE);
  if (!match) return { text: raw, products: [] };

  let products: ChatProduct[] = [];
  try {
    products = JSON.parse(match[1]);
  } catch {
    /* ignore malformed JSON */
  }

  const text = raw.replace(FENCE_RE, "").trim();
  return { text, products };
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Mình là **Choco Bot** 🍫\nMình có thể giúp bạn tìm sản phẩm, tư vấn mua hàng hoặc giải đáp thắc mắc. Bạn cần gì nào?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const raw: string = data.reply ?? "Xin lỗi, thử lại sau nhé!";
      const { text: replyText, products } = parseProductsFromReply(raw);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText, products },
      ]);
      if (!isOpen) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Có lỗi xảy ra, vui lòng thử lại!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Mở chat hỗ trợ"
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-[18px] shadow-lg
                     flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)",
          }}
        >
          {unread > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500
                             flex items-center justify-center text-white text-[10px] font-semibold border-2 border-white"
            >
              {unread}
            </span>
          )}
          <span
            className="absolute inset-0 rounded-[18px] border-2 animate-ping"
            style={{ borderColor: "rgba(216,90,48,0.45)" }}
          />
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="14" rx="4" />
            <circle cx="8.5" cy="11" r="1.5" fill="#fff" stroke="none" />
            <circle cx="15.5" cy="11" r="1.5" fill="#fff" stroke="none" />
            <path d="M8 18l-2 3h12l-2-3" />
          </svg>
          <span
            className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
            style={{
              borderColor: "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)",
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex flex-col rounded-2xl overflow-hidden border border-gray-200"
          style={{
            width: 420,
            height: 560,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 32px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
            background: "#fff",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)",
            }}
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="14" rx="4" />
                <circle cx="8.5" cy="11" r="1.5" fill="#fff" stroke="none" />
                <circle cx="15.5" cy="11" r="1.5" fill="#fff" stroke="none" />
                <path d="M8 18l-2 3h12l-2-3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm leading-none">
                Trợ lý Choco Kingdom
              </p>
              <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online 24/7
              </p>
            </div>

            <a
              href="https://zalo.me/0943648490"
              target="_blank"
              rel="noopener noreferrer"
              title="Nhắn tin CSKH"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        text-white transition hover:bg-white/30"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              💬 CSKH
            </a>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition"
              aria-label="Đóng"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && !loading && (
            <div
              className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-gray-100 bg-white flex-shrink-0"
              style={{ scrollbarWidth: "none" }}
            >
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition hover:border-orange-400"
                  style={{
                    background: "#FAECE7",
                    color: "#712B13",
                    borderColor: "#F5C4B3",
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 items-end ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "assistant" && <BotAvatar />}
                <div className="max-w-[85%] flex flex-col gap-2">
                  {/* Text bubble */}
                  {msg.content && (
                    <div
                      className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-tr-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)",
                            }
                          : {}
                      }
                    >
                      <span style={{ whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </span>
                    </div>
                  )}

                  {/* Product cards (horizontal) */}
                  {msg.role === "assistant" &&
                    msg.products &&
                    msg.products.length > 0 && (
                      <div className="flex flex-col gap-2 w-full">
                        {msg.products.map((p) => (
                          <ProductCardHorizontal key={p.id} product={p} />
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 items-end">
                <BotAvatar />
                <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2 items-center">
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition
                           disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #7b3f00 0%, #c0652b 100%)",
                }}
                aria-label="Gửi"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
