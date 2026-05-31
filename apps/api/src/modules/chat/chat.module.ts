// chat/chat.module.ts
// IntentProcessor đã bị loại bỏ — không cần import nữa.

import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MCPToolsService } from './mcp-tools.service';
import { MemoryProvider } from './providers/memory.provider';
import { MCPGuardService } from './mcp-guard.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    MCPToolsService,
    MemoryProvider,
    MCPGuardService,
    // IntentProcessor đã xóa — không còn regex Tier 1
  ],
})
export class ChatModule {}
