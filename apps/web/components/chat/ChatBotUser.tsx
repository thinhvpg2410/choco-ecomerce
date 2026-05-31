"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "sweetbakery_chat_history";

const BotAvatar = () => (
  <div
    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
    style={{ background: "#FAECE7" }}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D85A30"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="14" rx="4" />
      <circle cx="8.5" cy="11" r="1.5" fill="#D85A30" stroke="none" />
      <circle cx="15.5" cy="11" r="1.5" fill="#D85A30" stroke="none" />
      <path d="M8 18l-2 3h12l-2-3" />
    </svg>
  </div>
);

const ChatBotUser = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Mình là trợ lý của Choco Kingdom Mình có thể giúp gì cho bạn hôm nay ạ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 1) setMessages(parsed);
      } catch (e) {
        console.error("Parse chat error:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem(STORAGE_KEY);
      setMessages([
        {
          sender: "bot",
          text: "Xin chào! Mình là trợ lý của Choco Kingdom Mình có thể giúp gì cho bạn hôm nay ạ?",
        },
      ]);
    };
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      console.log("=== CHAT DEBUG ===");
      console.log("URL:", `http://localhost:5000/chat/ask`);
      console.log("Token:", token);

      const res = await fetch(`http://localhost:5000/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: userText }),
      });

      console.log("Status:", res.status);
      console.log("Response:", await res.clone().text());

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.message || "Dạ em chưa hiểu lắm ạ!",
          suggestedProducts: data.suggestedProducts || [],
          compareIds: data.compareIds || null,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops! Có lỗi kết nối rồi, thử lại sau ít phút nhé! 😅",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_CHIPS = [
    "Xem sản phẩm",
    "Ưu đãi hôm nay",
    "Theo dõi đơn hàng",
    "Liên hệ hỗ trợ",
  ];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-[18px] shadow-lg
                     flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{ background: "#D85A30" }}
          aria-label="Mở chat"
        >
          {unread > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500
                         flex items-center justify-center text-white text-[10px] font-semibold border-2 border-white"
            >
              {unread}
            </span>
          )}
          {/* Pulse ring */}
          <span
            className="absolute inset-0 rounded-[18px] border-2 animate-ping"
            style={{ borderColor: "rgba(216,90,48,0.45)" }}
          />
          {/* Bot icon */}
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
          {/* Online dot */}
          <span
            className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
            style={{ borderColor: "#D85A30" }}
          />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex flex-col rounded-2xl overflow-hidden border border-gray-200"
          style={{
            width: 420,
            height: 560,
            boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
            background: "#fff",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "#D85A30" }}
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
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                Online 24/7
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
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

          {/* Quick chips */}
          <div
            className="flex gap-2 px-3 py-2 overflow-x-auto border-b border-gray-100 bg-white"
            style={{ scrollbarWidth: "none" }}
          >
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setInput(chip);
                  setTimeout(() => sendMessage(), 50);
                }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition hover:border-orange-400"
                style={{
                  background: "#FAECE7",
                  color: "#712B13",
                  borderColor: "#F5C4B3",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 items-end ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.sender === "bot" && <BotAvatar />}
                <div className="max-w-[240px]">
                  <div
                    className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "text-white rounded-tr-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                    }`}
                    style={
                      msg.sender === "user" ? { background: "#D85A30" } : {}
                    }
                  >
                    {msg.text}
                  </div>

                  {(msg as any).suggestedProducts?.map((p: any) => (
                    <a
                      key={p.id}
                      href={`/product/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-2.5 bg-white border border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-sm transition-all group"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#D85A30"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2C8 2 4 5 4 9c0 2.5 1.5 4.5 3 6l5 7 5-7c1.5-1.5 3-3.5 3-6 0-4-4-7-8-7z" />
                              <circle cx="12" cy="9" r="2.5" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {p.sale_price ? (
                            <>
                              <span
                                className="text-xs font-bold"
                                style={{ color: "#D85A30" }}
                              >
                                {p.sale_price.toLocaleString("vi-VN")}đ
                              </span>
                              <span className="text-[10px] text-gray-400 line-through">
                                {p.price.toLocaleString("vi-VN")}đ
                              </span>
                            </>
                          ) : (
                            <span
                              className="text-xs font-bold"
                              style={{ color: "#D85A30" }}
                            >
                              {p.price.toLocaleString("vi-VN")}đ
                            </span>
                          )}
                        </div>
                        <p
                          className="text-[10px] mt-1 font-medium"
                          style={{ color: "#993C1D" }}
                        >
                          Xem chi tiết →
                        </p>
                      </div>
                    </a>
                  ))}

                  {(msg as any).compareIds?.length >= 2 && (
                    <a
                      href={`/compare?ids=${(msg as any).compareIds.join(",")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-2 p-2.5 bg-white border border-gray-200
                                 rounded-xl hover:border-orange-400 transition"
                    >
                      <span className="text-base">⚖️</span>
                      <div>
                        <p className="text-xs font-medium text-gray-800">
                          So sánh {(msg as any).compareIds.length} sản phẩm
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#993C1D" }}
                        >
                          Xem bảng so sánh →
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 items-end">
                <BotAvatar />
                <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full inline-block animate-bounce"
                        style={{
                          background: "#D85A30",
                          animationDelay: `${delay}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100">
            <div className="flex gap-2 items-center">
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Nhập tin nhắn..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white transition
                           disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                style={{ background: "#D85A30" }}
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
};

export default ChatBotUser;
