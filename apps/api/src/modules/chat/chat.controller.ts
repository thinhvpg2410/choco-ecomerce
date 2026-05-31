// chat/chat.controller.ts

import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { AskDto } from './dto/ask.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { MCPToolsService } from './mcp-tools.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly mcpToolsService: MCPToolsService,
  ) {}

  @Public()
  @Post('ask')
  async ask(@Body() dto: AskDto, @Req() req: Request) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const sessionId =
      dto.sessionId || (token ? `user_${token.slice(-16)}` : 'guest');
    const realUserId = (req as any).user?.sub || undefined;

    return this.chatService.ask(dto.prompt, sessionId, realUserId);
  }

  // DEV ONLY — xóa trước khi deploy production
  // @Public() để không bị JWT guard chặn khi test
  @Public()
  @Post('dev/mcp-test')
  async devMcpTest(@Body() body: { fn: string; args?: any }) {
    return this.mcpToolsService.devTest(body.fn, body.args ?? {});
  }
}
