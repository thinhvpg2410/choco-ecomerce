// chat/providers/memory.provider.ts
// ─────────────────────────────────────────────────────────────────────────────
// Simplified cho pure agent architecture.
// Agent đọc history dạng plain text để inject vào system prompt,
// không cần lưu intent/constraints phức tạp nữa.
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';

export interface ChatSession {
  lastProduct?: string; // tên SP cuối cùng được nhắc (dùng cho "cái này", "sản phẩm đó")
  history: string[]; // plain text ["Khách: ...", "Bot: ..."], mới nhất ở đầu
}

@Injectable()
export class MemoryProvider {
  private readonly sessions = new Map<string, ChatSession>();

  get(sessionId: string): ChatSession {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { history: [] });
    }
    return this.sessions.get(sessionId)!;
  }

  update(
    sessionId: string,
    userMsg: string,
    botMsg: string,
    lastProduct?: string,
  ) {
    const session = this.get(sessionId);

    if (lastProduct) {
      session.lastProduct = lastProduct;
    }

    // Thêm vào đầu (mới nhất trước) — giới hạn 10 dòng (5 lượt hội thoại)
    session.history.unshift(`Bot: ${botMsg}`, `Khách: ${userMsg}`);
    if (session.history.length > 10) {
      session.history = session.history.slice(0, 10);
    }
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}
