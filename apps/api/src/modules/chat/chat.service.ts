import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { buildSystemPrompt } from "./lib/chatbot-rules";
 
@Injectable()
export class ChatService {
  private formatProduct(p: any): string {
    const price = p.sale_price
      ? `${p.sale_price.toLocaleString()}đ (giảm từ ${p.price.toLocaleString()}đ)`
      : `${p.price.toLocaleString()}đ`;
    const stock = p.stock > 0 ? `còn ${p.stock} sản phẩm` : "hết hàng";
    const rating =
      p.review_count > 0
        ? ` | ⭐ ${p.average_rating}/5 (${p.review_count} đánh giá)`
        : "";
    const tags = [
      p.is_new         ? "🆕 Mới"       : "",
      p.is_featured    ? "⭐ Nổi bật"   : "",
      p.is_best_seller ? "🔥 Bán chạy"  : "",
      p.sale_price     ? "🏷️ Giảm giá" : "",
    ].filter(Boolean).join(", ");
 
    return `- ${p.name} | ${price} | ${p.short_description || ""} | Thương hiệu: ${p.brand?.name || ""} | Danh mục: ${p.category?.name || ""} | ${stock}${rating}${tags ? ` | ${tags}` : ""}`;
  }
 
  private extractMentionedProducts(reply: string, allItems: any[]): any[] {
    if (!allItems.length) return [];
 
    const matched: any[] = [];
    const seen = new Set<number>();
 
    for (const item of allItems) {
      if (seen.has(item.id)) continue;
      if (reply.includes(item.name)) {
        matched.push({
          id:          item.id,
          name:        item.name,
          price:       item.price,
          sale_price:  item.sale_price ?? null,
          image_url:   item.image_url,
          stock:       item.stock,
          is_new:      item.is_new ?? false,
          brand:       item.brand ? { name: item.brand.name } : null,
        });
        seen.add(item.id);
      }
    }
 
    return matched;
  }
 
  async chat(messages: { role: string; content: string }[]) {
    // ── Lấy sản phẩm ──────────────────────────────────────────────
    let allItems: any[]        = [];
    let productList            = "Không thể tải danh sách sản phẩm.";
    let newProducts            = "";
    let featuredProducts       = "";
    let bestSellerProducts     = "";
    let saleProducts           = "";
    let inStockProducts        = "";
 
    try {
      const res = await fetch(`${process.env.API_URL}/api/products?limit=50`);
      const data = await res.json();
      allItems = data.data?.items ?? [];
 
      productList        = allItems.map(p => this.formatProduct(p)).join("\n")                          || "Không có sản phẩm.";
      newProducts        = allItems.filter(p => p.is_new).map(p => this.formatProduct(p)).join("\n")        || "Hiện chưa có sản phẩm mới.";
      featuredProducts   = allItems.filter(p => p.is_featured).map(p => this.formatProduct(p)).join("\n")   || "Hiện chưa có sản phẩm nổi bật.";
      bestSellerProducts = allItems.filter(p => p.is_best_seller).map(p => this.formatProduct(p)).join("\n")|| "Hiện chưa có sản phẩm bán chạy.";
      saleProducts       = allItems.filter(p => p.sale_price).map(p => this.formatProduct(p)).join("\n")    || "Hiện không có sản phẩm đang giảm giá.";
      inStockProducts    = allItems.filter(p => p.stock > 0).map(p => this.formatProduct(p)).join("\n")     || "Hiện tất cả sản phẩm đang hết hàng.";
    } catch (err) {
      console.error("Lỗi lấy sản phẩm:", err);
    }
 
    const systemPrompt = buildSystemPrompt(
      productList, newProducts, featuredProducts,
      bestSellerProducts, saleProducts, inStockProducts,
    );
 
    // ── Gọi OpenRouter ─────────────────────────────────────────────
    try {
      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
          "X-Title":       "Choco Store",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      });
 
      const result = await aiRes.json();
      const fullReply: string =
        result.choices?.[0]?.message?.content || "Xin lỗi, thử lại sau nhé!";
 
      // ── Inject product JSON fence ──────────────────────────────
      const mentionedProducts = this.extractMentionedProducts(fullReply, allItems);
      const reply =
        mentionedProducts.length > 0
          ? `${fullReply}\n<!--PRODUCTS_JSON\n${JSON.stringify(mentionedProducts)}\n-->`
          : fullReply;
 
      return { reply };
    } catch (err) {
      console.error("Lỗi OpenRouter:", err);
      throw new HttpException(
        { reply: "Lỗi kết nối AI, thử lại sau nhé!" },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}