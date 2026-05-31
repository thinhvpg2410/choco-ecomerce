// chat/types/search.types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tách type ra khỏi intent.processor.ts để mcp-tools.service.ts không còn
// phụ thuộc vào IntentProcessor (đã bị xóa trong kiến trúc pure-agent).
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchConstraints {
  keyword?: string;
  brand_name?: string;
  category_name?: string;
  origin?: string;
  imported?: boolean;
  semantic_keywords?: string[];
  min_price?: number;
  max_price?: number;
  limit?: number;
  sort_by?:
    | 'price_asc'
    | 'price_desc'
    | 'isBestSeller'
    | 'isNew'
    | 'isFeatured';
}
