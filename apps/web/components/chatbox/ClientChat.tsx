"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Send, X, Minimize2, Maximize2, MessageCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  roomId: string;
  senderId: string;
  senderRole: "client" | "admin";
  message: string;
  timestamp: string;
}

interface Props {
  userId: string;
  username?: string;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

// ─── Component ────────────────────────────────────────────────────────────────
export function ClientChat({ userId, username, isOpen, onClose }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminIsTyping, setAdminIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roomId = `room_${userId}`;

  // ── Socket setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    s.on("connect", () => {
      setIsConnected(true);
      s.emit("register", { userId, role: "client" });
    });

    s.on("disconnect", () => setIsConnected(false));

    s.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      // Nếu chat đang đóng/minimize → tăng unread
      if (!isOpen || isMinimized) {
        setUnreadCount((n) => n + 1);
      }
    });

    s.on("admin_typing", () => {
      setAdminIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setAdminIsTyping(false), 2500);
    });

    setSocket(s);
    return () => {
      s.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Auto scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  // ── Clear unread khi mở chat ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // ── Gửi tin nhắn ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !socket || !isConnected) return;

    const msg: Message = {
      roomId,
      message: text,
      senderId: userId,
      senderRole: "client",
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
    inputRef.current?.focus();
  }, [input, socket, isConnected, roomId, userId]);

  // ── Handle typing indicator gửi lên server ────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socket?.emit("client_typing", { roomId });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const displayName = username || `User #${userId.slice(-6)}`;

  // ── Không render gì khi chưa open ─────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <>
      {/* ── Global styles (scoped) ── */}
      <style>{`
        .cc-wrap * { box-sizing: border-box; }

        .cc-wrap {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* ── Shell ── */
        .cc-shell {
          width: 340px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(59,31,10,0.18), 0 2px 8px rgba(0,0,0,0.08);
          background: #fff;
          display: flex;
          flex-direction: column;
          transition: height 0.3s cubic-bezier(.4,0,.2,1);
        }
        .cc-shell.minimized { height: 56px; }
        .cc-shell.expanded  { height: 480px; }

        /* ── Header ── */
        .cc-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          height: 56px;
          background: linear-gradient(135deg, #3B1F0A 0%, #7B4A28 60%, #A0673A 100%);
          flex-shrink: 0;
          cursor: pointer;
          user-select: none;
        }
        .cc-header-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C48A3F, #e0b87a);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #3B1F0A;
          flex-shrink: 0;
        }
        .cc-header-info { flex: 1; min-width: 0; }
        .cc-header-title {
          font-size: 13px; font-weight: 700;
          color: #fff; letter-spacing: 0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cc-header-status {
          font-size: 11px; color: rgba(255,255,255,0.70);
          display: flex; align-items: center; gap: 4px;
          margin-top: 1px;
        }
        .cc-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 2px rgba(74,222,128,0.3);
          flex-shrink: 0;
          transition: background 0.3s;
        }
        .cc-status-dot.offline { background: #9ca3af; box-shadow: none; }
        .cc-header-actions {
          display: flex; gap: 4px; align-items: center;
        }
        .cc-icon-btn {
          width: 28px; height: 28px;
          border-radius: 8px; border: none;
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .cc-icon-btn:hover { background: rgba(255,255,255,0.22); }

        /* ── Messages area ── */
        .cc-body {
          flex: 1;
          overflow-y: auto;
          padding: 14px 14px 6px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #faf7f4;
          scroll-behavior: smooth;
        }
        .cc-body::-webkit-scrollbar { width: 4px; }
        .cc-body::-webkit-scrollbar-track { background: transparent; }
        .cc-body::-webkit-scrollbar-thumb { background: #d4b896; border-radius: 4px; }

        /* ── Welcome message ── */
        .cc-welcome {
          text-align: center;
          padding: 20px 10px 10px;
          color: #9a7a60;
          font-size: 12.5px;
          line-height: 1.6;
        }
        .cc-welcome-icon {
          font-size: 28px;
          margin-bottom: 6px;
          display: block;
        }
        .cc-welcome strong { color: #7B4A28; }

        /* ── Bubble ── */
        .cc-bubble-row {
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }
        .cc-bubble-row.mine  { flex-direction: row-reverse; }
        .cc-bubble-row.theirs { flex-direction: row; }

        .cc-bubble-avatar {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7B4A28, #C48A3F);
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: #fff;
          margin-bottom: 2px;
        }

        .cc-bubble {
          max-width: 210px;
          padding: 9px 13px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.45;
          word-break: break-word;
          position: relative;
        }
        .cc-bubble.mine {
          background: linear-gradient(135deg, #7B4A28, #A0673A);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .cc-bubble.theirs {
          background: #fff;
          color: #2d1a0e;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .cc-bubble-time {
          font-size: 10px;
          margin-top: 3px;
          opacity: 0.55;
          text-align: right;
        }
        .cc-bubble.theirs .cc-bubble-time { text-align: left; }

        /* ── Typing indicator ── */
        .cc-typing {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0 6px;
        }
        .cc-typing-dots {
          display: flex; gap: 4px; align-items: center;
          background: #fff;
          padding: 8px 13px;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .cc-typing-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #C48A3F;
          animation: cc-bounce 1.2s infinite;
        }
        .cc-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .cc-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cc-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        /* ── Input area ── */
        .cc-footer {
          padding: 10px 12px 12px;
          background: #fff;
          border-top: 1px solid #f0e8df;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .cc-input {
          flex: 1;
          padding: 9px 13px;
          border: 1.5px solid #e8d9cb;
          border-radius: 22px;
          font-size: 13.5px;
          font-family: inherit;
          outline: none;
          background: #faf7f4;
          color: #2d1a0e;
          transition: border-color 0.15s;
        }
        .cc-input::placeholder { color: #c4a98a; }
        .cc-input:focus { border-color: #A0673A; background: #fff; }
        .cc-send-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #7B4A28, #A0673A);
          color: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(123,74,40,0.25);
        }
        .cc-send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          box-shadow: 0 4px 14px rgba(123,74,40,0.35);
        }
        .cc-send-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* ── Offline banner ── */
        .cc-offline-bar {
          background: #fef3c7;
          color: #92400e;
          font-size: 11.5px;
          text-align: center;
          padding: 5px 12px;
          font-weight: 500;
          border-top: 1px solid #fde68a;
        }

        /* ── Enter animation ── */
        @keyframes cc-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cc-shell { animation: cc-slide-up 0.25s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div className="cc-wrap">
        <div className={`cc-shell ${isMinimized ? "minimized" : "expanded"}`}>

          {/* ── Header ── */}
          <div className="cc-header" onClick={() => setIsMinimized((v) => !v)}>
            <div className="cc-header-avatar">🍫</div>

            <div className="cc-header-info">
              <div className="cc-header-title">Hỗ trợ Choco Kingdom</div>
              <div className="cc-header-status">
                <span className={`cc-status-dot ${isConnected ? "" : "offline"}`} />
                {isConnected ? "Đang trực tuyến" : "Đang kết nối lại..."}
              </div>
            </div>

            <div
              className="cc-header-actions"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="cc-icon-btn"
                title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                onClick={() => setIsMinimized((v) => !v)}
              >
                {isMinimized ? (
                  <Maximize2 size={13} />
                ) : (
                  <Minimize2 size={13} />
                )}
              </button>
              <button className="cc-icon-btn" title="Đóng" onClick={onClose}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* ── Body (ẩn khi minimize) ── */}
          {!isMinimized && (
            <>
              <div className="cc-body">
                {/* Welcome */}
                {messages.length === 0 && (
                  <div className="cc-welcome">
                    <span className="cc-welcome-icon">🍫</span>
                    Xin chào <strong>{displayName}</strong>!<br />
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn.
                    <br />
                    Hãy gửi tin nhắn để bắt đầu.
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div
                      key={i}
                      className={`cc-bubble-row ${isMine ? "mine" : "theirs"}`}
                    >
                      {!isMine && (
                        <div className="cc-bubble-avatar">A</div>
                      )}
                      <div className={`cc-bubble ${isMine ? "mine" : "theirs"}`}>
                        {msg.message}
                        <div className="cc-bubble-time">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Admin typing */}
                {adminIsTyping && (
                  <div className="cc-typing">
                    <div className="cc-bubble-avatar">A</div>
                    <div className="cc-typing-dots">
                      <div className="cc-typing-dot" />
                      <div className="cc-typing-dot" />
                      <div className="cc-typing-dot" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Offline bar */}
              {!isConnected && (
                <div className="cc-offline-bar">
                  ⚠️ Mất kết nối — đang thử lại...
                </div>
              )}

              {/* Input */}
              <div className="cc-footer">
                <input
                  ref={inputRef}
                  className="cc-input"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  maxLength={500}
                  disabled={!isConnected}
                />
                <button
                  className="cc-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || !isConnected}
                  title="Gửi"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
