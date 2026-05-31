// chat/mcp-guard.service.ts
import { Injectable } from '@nestjs/common';

const BANNED_PATTERNS = [
  /drop\s+table/i,
  /delete\s+from/i,
  /truncate/i,
  /update\s+\w+\s+set/i,
  /insert\s+into/i,
  /alter\s+table/i,
  /grant\s+/i,
  /revoke\s+/i,
  /exec\s*\(/i,
  /xp_cmdshell/i,
  /union\s+select/i,
  /;\s*drop/i,
  /--\s*drop/i,
  /ignore\s+previous\s+instructions/i,
  /you\s+are\s+now/i,
  /forget\s+your\s+instructions/i,
  /act\s+as\s+/i,
];

@Injectable()
export class MCPGuardService {
  isSafe(prompt: string): boolean {
    return !BANNED_PATTERNS.some((pattern) => pattern.test(prompt));
  }

  sanitize(prompt: string): string {
    // Giới hạn độ dài
    return prompt.slice(0, 500).trim();
  }
}
