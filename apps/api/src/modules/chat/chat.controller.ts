
import { Controller, Post, Body } from "@nestjs/common";
import { ChatService } from "./chat.service";

import { IsArray, IsString, IsIn } from "class-validator";
import { Public } from "../../common/decorators/public.decorator";

@Public()
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: { messages: { role: string; content: string }[] }) {
    return this.chatService.chat(body.messages);
  }
}