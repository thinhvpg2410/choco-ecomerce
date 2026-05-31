// chat/chat.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// KIẾN TRÚC MỚI: Pure AI Agent — bỏ hoàn toàn Tier 1 regex
//
// Flow:
//   User message
//     → buildAgentSystemPrompt (inject shop info + history + anti-hallucination rules)
//     → Groq llama-3.3-70b-versatile (tool calling)
//     → LLM tự quyết định: gọi tool nào / trả lời thẳng
//     → Nếu có tool_calls → executeTool song song → trả kết quả lại LLM
//     → LLM format câu trả lời cuối từ data thật
//     → Trả về user
//
// Ưu điểm so với regex:
//   ✓ Hiểu ngôn ngữ tự nhiên ("đến từ Việt Nam" → origin: "Việt Nam")
//   ✓ Không extract keyword sai ("đến", "sao", "không?")
//   ✓ Xử lý câu phức hợp ("socola Bỉ dưới 200k bán chạy nhất")
//   ✓ Gọi nhiều tool song song khi cần (so sánh, multi-question)
//   ✓ Context-aware tự nhiên qua conversation history
//   ✓ Không hallucinate vì có anti-hallucination rules trong system prompt
// ─────────────────────────────────────────────────────────────────────────────

import { Injectable } from '@nestjs/common';
import { MCPToolsService } from './mcp-tools.service';
import { MemoryProvider } from './providers/memory.provider';
import { MCPGuardService } from './mcp-guard.service';
import { AskResponse } from './dto/ask.dto';
import {
  AGENT_TOOL_DEFINITIONS,
  buildAgentSystemPrompt,
} from './chat.agent.config';
import { SearchConstraints } from './types/search.types';

const AGENT_MAX_TOOL_ROUNDS = 4; // tăng lên 4 để xử lý multi-step (so sánh, multi-question)

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class ChatService {
  private readonly groqApiKey = process.env.GROQ_API_KEY || '';

  constructor(
    private readonly mcpTools: MCPToolsService,
    private readonly memoryProvider: MemoryProvider,
    private readonly mcpGuard: MCPGuardService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: ask — entry point duy nhất
  // ─────────────────────────────────────────────────────────────────────────

  async ask(
    prompt: string,
    sessionId: string,
    realUserId?: string,
  ): Promise<AskResponse> {
    if (!prompt?.trim()) {
      return {
        message: 'Dạ anh/chị nhắn gì cho em với ạ! 🥰',
        suggestedProducts: [],
      };
    }

    const sanitized = this.mcpGuard.sanitize(prompt);
    console.log('\n========== 📥 NEW REQUEST ==========');
    console.log(
      `[INPUT] "${sanitized}" | Session: ${sessionId} | User: ${realUserId || 'Guest'}`,
    );

    if (!this.mcpGuard.isSafe(sanitized)) {
      return {
        message:
          'Dạ yêu cầu chứa nội dung không phù hợp với quy định của tiệm ạ! 🙏',
        suggestedProducts: [],
      };
    }

    const session = this.memoryProvider.get(sessionId);
    const conversationHistory = session.history.slice(0, 8).join('\n');

    // Build system prompt với đầy đủ context
    const systemPrompt = buildAgentSystemPrompt({
      isLoggedIn: !!realUserId,
      conversationHistory,
    });

    // Tất cả đều đi qua AI agent
    const result = await this.runAgentLoop(
      systemPrompt,
      sanitized,
      session,
      realUserId,
    );

    console.log(`[BOT] "${result.botReply}"`);
    console.log('========== 📤 END REQUEST ==========\n');

    // Lưu vào session memory
    this.memoryProvider.update(
      sessionId,
      sanitized,
      result.botReply,
      result.lastProduct,
    );

    return {
      message: result.botReply,
      suggestedProducts: result.suggestedProducts,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AGENT LOOP — LLM tự quyết định gọi tool, lặp tối đa AGENT_MAX_TOOL_ROUNDS
  // ─────────────────────────────────────────────────────────────────────────

  private async runAgentLoop(
    systemPrompt: string,
    userMessage: string,
    session: ReturnType<MemoryProvider['get']>,
    realUserId?: string,
  ): Promise<{
    botReply: string;
    suggestedProducts: AskResponse['suggestedProducts'];
    lastProduct?: string;
  }> {
    let messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    let suggestedProducts: AskResponse['suggestedProducts'] = [];
    let lastProduct: string | undefined;

    for (let round = 1; round <= AGENT_MAX_TOOL_ROUNDS; round++) {
      const response = await this.callGroq(messages, AGENT_TOOL_DEFINITIONS);

      // Không có tool call → LLM đã trả lời thẳng
      if (!response.tool_calls?.length) {
        const botReply =
          response.content?.trim() ||
          'Dạ em chưa hiểu ý anh/chị, anh/chị nói rõ hơn được không ạ? 😊';
        return { botReply, suggestedProducts, lastProduct };
      }

      console.log(
        `[AGENT ROUND ${round}] Tools: ${response.tool_calls.map((t: any) => `${t.function.name}(${t.function.arguments})`).join(' | ')}`,
      );

      // Thực thi tất cả tool calls SONG SONG
      const toolResults = await this.executeToolCallsParallel(
        response.tool_calls,
        realUserId,
        session.lastProduct,
      );

      // Thu thập suggestedProducts từ kết quả tool
      this.collectSuggestedProducts(toolResults, suggestedProducts, (name) => {
        if (!lastProduct) lastProduct = name;
      });

      // Thêm assistant message + tool results vào conversation
      messages = [
        ...messages,
        {
          role: 'assistant',
          content: response.content || null,
          tool_calls: response.tool_calls,
        },
        ...toolResults.map((r) => ({
          role: 'tool',
          tool_call_id: r.id,
          content: r.content,
        })),
      ];

      // Tiếp tục loop — LLM sẽ đọc tool results và quyết định trả lời hoặc gọi tool tiếp
    }

    return {
      botReply:
        'Dạ em đang xử lý nhiều thông tin quá, anh/chị thử hỏi lại ngắn gọn hơn nhé! 😊',
      suggestedProducts,
      lastProduct,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXECUTE TOOL CALLS — song song (Promise.all)
  // ─────────────────────────────────────────────────────────────────────────

  private async executeToolCallsParallel(
    toolCalls: any[],
    realUserId?: string,
    lastProduct?: string,
  ): Promise<Array<{ id: string; name: string; content: string; raw: any }>> {
    return Promise.all(
      toolCalls.map(async (tc: any) => {
        let args: any = {};
        try {
          args = JSON.parse(tc.function.arguments || '{}');
        } catch {
          args = {};
        }

        const raw = await this.executeSingleTool(
          tc.function.name,
          args,
          realUserId,
          lastProduct,
        );

        // __noData flag giúp LLM biết khi nào không có kết quả để không hallucinate
        const noData =
          !raw ||
          raw.error ||
          raw.found === false ||
          raw.count === 0 ||
          (Array.isArray(raw.products) && raw.products.length === 0) ||
          (Array.isArray(raw.categories) && raw.categories.length === 0) ||
          (Array.isArray(raw.brands) && raw.brands.length === 0) ||
          (Array.isArray(raw.orders) && raw.orders.length === 0);

        console.log(
          `  [TOOL] ${tc.function.name} → ${noData ? 'NO DATA' : `${raw?.count ?? raw?.products?.length ?? 1} result(s)`}`,
        );

        return {
          id: tc.id,
          name: tc.function.name,
          content: JSON.stringify({ ...raw, __noData: noData }),
          raw,
        };
      }),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SINGLE TOOL EXECUTOR
  // ─────────────────────────────────────────────────────────────────────────

  private async executeSingleTool(
    name: string,
    args: any,
    realUserId?: string,
    lastProduct?: string,
  ): Promise<any> {
    switch (name) {
      case 'search_products': {
        const params: SearchConstraints = {
          keyword: args.keyword,
          brand_name: args.brand_name,
          category_name: args.category_name,
          origin: args.origin,
          semantic_keywords: args.semantic_keywords,
          min_price: args.min_price,
          max_price: args.max_price,
          sort_by: args.sort_by,
          limit: args.limit ?? 5,
        };
        return this.mcpTools.executeUnifiedSearch(params);
      }

      case 'get_product_detail':
        return this.mcpTools.getProductDetail(
          args.keyword || lastProduct || '',
        );

      case 'get_categories':
        return this.mcpTools.getCategories();

      case 'get_brands':
        return this.mcpTools.getBrands();

      case 'get_store_statistics':
        return this.mcpTools.getStoreStatistics();

      case 'get_top_expensive_products':
        return this.mcpTools.getTopExpensiveProducts(args.limit ?? 5);

      case 'get_top_cheap_products':
        return this.mcpTools.getTopCheapProducts(args.limit ?? 5);

      case 'get_my_orders':
        if (!realUserId)
          return { error: 'Khách chưa đăng nhập', __needLogin: true };
        return this.mcpTools.getMyOrders(realUserId, args.limit ?? 5);

      case 'get_order_detail':
        if (!realUserId)
          return { error: 'Khách chưa đăng nhập', __needLogin: true };
        return this.mcpTools.getOrderDetail(args.order_id, realUserId);

      default:
        return { error: `Tool không tồn tại: ${name}` };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECT SUGGESTED PRODUCTS — từ tool results để trả về frontend
  // ─────────────────────────────────────────────────────────────────────────

  private collectSuggestedProducts(
    toolResults: Array<{ name: string; raw: any }>,
    suggestedProducts: AskResponse['suggestedProducts'],
    setLastProduct: (name: string) => void,
  ) {
    for (const r of toolResults) {
      // search_products, get_top_cheap, get_top_expensive đều trả { products: [...] }
      if (r.raw?.products?.length) {
        if (!suggestedProducts.length) setLastProduct(r.raw.products[0].name);
        suggestedProducts.push(
          ...r.raw.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            sale_price: p.salePrice ? Number(p.salePrice) : null,
            image_url: p.imageUrl ?? null,
          })),
        );
      }

      // get_product_detail trả { found: true, product: {...} }
      if (r.raw?.found && r.raw?.product) {
        const p = r.raw.product;
        if (!suggestedProducts.length) setLastProduct(p.name);
        suggestedProducts.push({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          sale_price: p.salePrice ? Number(p.salePrice) : null,
          image_url: p.imageUrl ?? null,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GROQ API CALL
  // ─────────────────────────────────────────────────────────────────────────

  private async callGroq(
    messages: any[],
    tools: any[] = [],
  ): Promise<{ content: string | null; tool_calls?: any[] }> {
    if (!this.groqApiKey) {
      console.error('[GROQ] GROQ_API_KEY chưa cấu hình');
      return {
        content: 'Dạ hệ thống đang bảo trì, anh/chị liên hệ hotline nhé! 🙏',
      };
    }

    try {
      const body: any = {
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 600,
        temperature: 0.1, // thấp để consistent, không sáng tạo quá mức
      };

      if (tools.length > 0) {
        body.tools = tools;
        body.tool_choice = 'auto';
      }

      const res = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.groqApiKey}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error('[GROQ HTTP ERROR]', res.status, errText);

        // Rate limit → trả về thông báo rõ ràng
        if (res.status === 429) {
          return {
            content:
              'Dạ tiệm đang bận xử lý nhiều yêu cầu, anh/chị thử lại sau vài giây nhé! 🥰',
          };
        }
        return { content: 'Dạ hệ thống đang bận, thử lại sau nhé! 🥰' };
      }

      const data = await res.json();
      const choice = data.choices?.[0]?.message;

      if (!choice) {
        console.error('[GROQ] Empty choice:', JSON.stringify(data));
        return { content: 'Dạ hệ thống trả về lỗi, anh/chị thử lại nhé!' };
      }

      return {
        content: choice.content?.trim() || null,
        tool_calls: choice.tool_calls,
      };
    } catch (err) {
      console.error('[GROQ FETCH ERROR]', err);
      return { content: 'Dạ hệ thống tiệm em đang xử lý chút xíu ạ! 🥰' };
    }
  }
}
