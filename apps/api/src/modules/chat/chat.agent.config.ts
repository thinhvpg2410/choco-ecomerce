// chat/chat.agent.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Tool descriptions viết chi tiết để LLM (llama-3.3-70b) tự suy luận đúng,
// không cần regex. Mỗi description có ví dụ câu user → tool nào nên dùng.
// ─────────────────────────────────────────────────────────────────────────────

export const SHOP_INFO = {
  name: 'Choco Kingdom',
  type: 'Cửa hàng bánh kẹo nhập khẩu trực tuyến, giao hàng tận nơi toàn quốc (không có cửa hàng offline)',
  hours: '08:00 - 21:00 hàng ngày',
  hotline: '0961.439.551',
  payment: 'COD, Chuyển khoản ngân hàng. Không hỗ trợ trả góp.',
  shipping: 'Giao hàng toàn quốc. Thời gian: 2-4 ngày. Giao nhanh tại TP.HCM.',
  return_policy:
    'Đổi trả miễn phí trong 7 ngày nếu lỗi sản xuất hoặc hư hỏng khi vận chuyển.',
  cancel_policy: 'Hủy đơn miễn phí trước khi bàn giao cho đơn vị vận chuyển.',
};

export const AGENT_TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: `Tìm kiếm sản phẩm trong cửa hàng. Dùng tool này khi khách hỏi về sản phẩm theo bất kỳ tiêu chí nào.

LUÔN dùng tool này cho các câu hỏi:
- Tìm theo tên/loại: "có Oreo không", "bánh quy nào ngon", "kẹo dẻo"
- Tìm theo thương hiệu: "có Ferrero không", "sản phẩm KitKat", "đồ Haribo"
- Tìm theo xuất xứ: "bánh Hàn Quốc", "đồ Nhật", "hàng từ Mỹ", "có bánh Việt Nam không", "sản phẩm từ Ý"
- Tìm theo giá: "dưới 50k", "khoảng 100k", "tầm 200k", "snack rẻ", "socola cao cấp tầm 300k"
- Top sản phẩm: "rẻ nhất", "đắt nhất", "bán chạy nhất", "mới nhất", "10 sản phẩm rẻ nhất"
- Semantic/gợi ý: "đồ ăn vặt xem phim", "quà tặng", "bánh tết", "snack cay", "healthy", "ít ngọt", "cho bé"
- Câu kết hợp: "socola Bỉ dưới 200k", "kẹo Hàn bán chạy", "5 bánh Nhật rẻ nhất"

Hướng dẫn điền tham số:
- keyword: tên sản phẩm cụ thể ("Oreo", "Snickers", "Pocky"). KHÔNG điền từ chỉ xuất xứ, giá, hoặc mô tả chung ("Hàn", "rẻ", "ngon")
- brand_name: tên thương hiệu ("Ferrero", "KitKat", "Haribo", "Oreo", "Danisa")
- category_name: danh mục ("Socola", "Bánh quy", "Kẹo dẻo", "Snack")
- origin: quốc gia xuất xứ bằng tiếng Việt chuẩn ("Hàn Quốc", "Nhật Bản", "Mỹ", "Ý", "Bỉ", "Đức", "Pháp", "Anh", "Việt Nam", "Thái Lan", "Malaysia", "Singapore")
- semantic_keywords: mảng từ khóa mô tả đặc tính ("ít đường", "cay", "healthy", "quà tặng", "snack")
- min_price / max_price: giá theo VND (50000, 100000, 200000). "50k" = 50000, "1 triệu" = 1000000
- sort_by: "price_asc" (rẻ nhất), "price_desc" (đắt nhất), "isBestSeller" (bán chạy), "isNew" (mới nhất), "isFeatured" (nổi bật)
- limit: số lượng muốn lấy (mặc định 5, tối đa 10)`,
      parameters: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description:
              'Tên sản phẩm cụ thể. VD: "Oreo", "Snickers", "Pocky Socola"',
          },
          brand_name: {
            type: 'string',
            description: 'Tên thương hiệu. VD: "Ferrero", "KitKat", "Haribo"',
          },
          category_name: {
            type: 'string',
            description:
              'Tên danh mục. VD: "Socola", "Bánh quy", "Kẹo dẻo", "Snack"',
          },
          origin: {
            type: 'string',
            description:
              'Xuất xứ bằng tiếng Việt. VD: "Hàn Quốc", "Nhật Bản", "Mỹ", "Việt Nam", "Ý", "Bỉ"',
          },
          semantic_keywords: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Từ khóa mô tả đặc tính. VD: ["ít đường", "diet"], ["cay", "spicy"], ["quà", "gift"]',
          },
          min_price: {
            type: 'number',
            description: 'Giá tối thiểu (VND). "50k" = 50000',
          },
          max_price: {
            type: 'number',
            description:
              'Giá tối đa (VND). "100k" = 100000, "1 triệu" = 1000000',
          },
          sort_by: {
            type: 'string',
            enum: [
              'price_asc',
              'price_desc',
              'isBestSeller',
              'isNew',
              'isFeatured',
            ],
            description:
              '"price_asc"=rẻ nhất, "price_desc"=đắt nhất, "isBestSeller"=bán chạy, "isNew"=mới nhất, "isFeatured"=nổi bật',
          },
          limit: {
            type: 'number',
            description: 'Số sản phẩm muốn lấy. Mặc định 5, tối đa 10',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_product_detail',
      description: `Lấy thông tin chi tiết 1 sản phẩm cụ thể: giá, tồn kho, thành phần, calo, dinh dưỡng, đánh giá, xuất xứ, hạn sử dụng.

Dùng khi khách hỏi:
- "Danisa có bao nhiêu calo?", "thành phần của Snickers", "KitKat còn hàng không?"
- "Ferrero Rocher đánh giá mấy sao?", "giá Oreo Double Cream bao nhiêu?"
- So sánh 2 sản phẩm → gọi 2 lần tool này song song
- "sản phẩm này" / "cái đó" → dùng tên sản phẩm từ tin nhắn trước

Tham số keyword: tên sản phẩm đầy đủ hoặc một phần. VD: "Danisa", "Ferrero Rocher 16 viên", "KitKat Matcha"`,
      parameters: {
        type: 'object',
        required: ['keyword'],
        properties: {
          keyword: {
            type: 'string',
            description:
              'Tên sản phẩm cần tra. VD: "Danisa Butter Cookies", "Ferrero Rocher"',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_categories',
      description: `Lấy danh sách tất cả danh mục sản phẩm có trong cửa hàng.

Dùng khi khách hỏi:
- "shop có những loại gì?", "có mấy danh mục?", "shop bán gì?"
- "danh mục nào có?", "các loại sản phẩm của shop"`,
      parameters: { type: 'object', properties: {} },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_brands',
      description: `Lấy danh sách tất cả thương hiệu đang bán trong cửa hàng.

Dùng khi khách hỏi:
- "shop có thương hiệu nào?", "bán bao nhiêu thương hiệu?", "có brand gì?"
- "các hãng đang bán", "thương hiệu nổi tiếng nào có?"`,
      parameters: { type: 'object', properties: {} },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_store_statistics',
      description: `Lấy thống kê tổng quan: tổng số sản phẩm, số danh mục, số thương hiệu, giá trung bình/thấp/cao nhất.

Dùng khi khách hỏi:
- "shop có bao nhiêu sản phẩm?", "có mấy danh mục?", "bao nhiêu thương hiệu?"
- "shop có mấy loại mặt hàng?", "tổng quan về shop", "quy mô shop như thế nào?"
- "giá trung bình bao nhiêu?", "giá rẻ nhất/đắt nhất của shop?"`,
      parameters: { type: 'object', properties: {} },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_top_expensive_products',
      description: `Lấy danh sách sản phẩm có giá CAO NHẤT trong cửa hàng, sắp xếp theo giá giảm dần.

Dùng khi khách hỏi:
- "sản phẩm đắt nhất", "mắc nhất shop", "5 sản phẩm giá cao nhất"
- "cao cấp nhất", "premium nhất shop có gì?"`,
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Số lượng muốn lấy. Mặc định 5',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_top_cheap_products',
      description: `Lấy danh sách sản phẩm có giá THẤP NHẤT trong cửa hàng, sắp xếp theo giá tăng dần.

Dùng khi khách hỏi:
- "sản phẩm rẻ nhất", "giá thấp nhất", "10 món rẻ nhất shop"
- "bình dân nhất", "túi tiền ít có gì mua được không?"`,
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Số lượng muốn lấy. Mặc định 5',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_my_orders',
      description: `Lấy lịch sử đơn hàng của khách đã đăng nhập.

Dùng khi khách hỏi:
- "đơn hàng của tôi", "tôi đã mua gì?", "lịch sử mua hàng"
- "các đơn trước", "đơn gần đây"

LƯU Ý: Chỉ dùng khi khách đã đăng nhập (có realUserId). Nếu chưa đăng nhập → báo cần đăng nhập.`,
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Số đơn muốn lấy. Mặc định 5',
          },
        },
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_order_detail',
      description: `Lấy chi tiết một đơn hàng cụ thể theo mã đơn.

Dùng khi khách cung cấp mã đơn hàng và muốn tra cứu:
- "đơn hàng ABC123 đang ở đâu?", "trạng thái đơn #XYZ"
- "kiểm tra đơn hàng [mã]"`,
      parameters: {
        type: 'object',
        required: ['order_id'],
        properties: {
          order_id: {
            type: 'string',
            description: 'Mã đơn hàng cần tra cứu',
          },
        },
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — nhúng vào mọi request
// Viết kỹ để LLM không hallucinate, biết khi nào gọi tool, khi nào trả lời thẳng
// ─────────────────────────────────────────────────────────────────────────────

export function buildAgentSystemPrompt(params: {
  isLoggedIn: boolean;
  conversationHistory: string;
}): string {
  const { isLoggedIn, conversationHistory } = params;

  return `Bạn là trợ lý bán hàng thông minh của "${SHOP_INFO.name}" — cửa hàng bánh kẹo nhập khẩu trực tuyến.
Xưng "em", gọi khách "anh/chị". Trả lời tiếng Việt, thân thiện, tự nhiên, ngắn gọn.

═══════════════════════════════════════════
THÔNG TIN CỬA HÀNG (trả lời thẳng, KHÔNG cần gọi tool)
═══════════════════════════════════════════
• Loại hình: ${SHOP_INFO.type}
• Giờ làm việc: ${SHOP_INFO.hours}
• Hotline: ${SHOP_INFO.hotline}
• Thanh toán: ${SHOP_INFO.payment}
• Vận chuyển: ${SHOP_INFO.shipping}
• Đổi trả: ${SHOP_INFO.return_policy}
• Hủy đơn: ${SHOP_INFO.cancel_policy}
• Đặt hàng: Chọn sản phẩm → thêm vào giỏ → điền địa chỉ → xác nhận → chờ shop duyệt
• Áp mã giảm giá: Trang thanh toán → ô "Mã khuyến mãi" → nhập mã → Áp dụng
• Trạng thái khách: ${isLoggedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập (khách vãng lai)'}

═══════════════════════════════════════════
LUẬT GỌI TOOL
═══════════════════════════════════════════
GỌI TOOL khi cần dữ liệu thực từ DB:
✓ Hỏi về sản phẩm (tìm kiếm, chi tiết, tồn kho, calo, thành phần, đánh giá)
✓ Hỏi về thương hiệu, danh mục, thống kê shop
✓ Hỏi về đơn hàng (cần đăng nhập)
✓ So sánh 2+ sản phẩm → gọi get_product_detail cho từng sản phẩm SONG SONG

KHÔNG GỌI TOOL khi:
✗ Hỏi chính sách (vận chuyển, thanh toán, đổi trả, đặt hàng, áp mã)
✗ Chào hỏi, chitchat, cảm ơn
✗ Hỏi giờ mở cửa, hotline, địa chỉ

═══════════════════════════════════════════
LUẬT CHỐNG HALLUCINATION — BẮT BUỘC
═══════════════════════════════════════════
1. CHỈ nhắc sản phẩm, giá, tồn kho CÓ TRONG kết quả tool. TUYỆT ĐỐI không bịa.
2. Nếu tool trả về rỗng / __noData=true → nói thẳng: "Tiệm hiện chưa có sản phẩm phù hợp."
3. KHÔNG "gợi ý" sản phẩm không có trong tool result.
4. KHÔNG tiết lộ tên field kỹ thuật (count, isBestSeller, salePrice, __noData...).
5. Giá lấy từ salePrice (nếu có) hoặc price trong data. Format: XX.XXX đ.
6. Số liệu (số danh mục, thương hiệu) lấy từ tool result, KHÔNG tự đếm/đoán.

═══════════════════════════════════════════
HƯỚNG DẪN TRẢ LỜI
═══════════════════════════════════════════
• Câu trả lời 2-5 câu, emoji vừa phải (1-2 cái).
• Liệt kê sản phẩm: dùng dạng "1. Tên — XX.XXX đ", kèm brand/origin nếu có.
• Khi có salePrice < price: hiển thị "~~giá gốc~~ còn XX.XXX đ" để thấy đang sale.
• Nếu khách hỏi nhiều câu trong 1 tin → trả lời đủ từng câu.
• KHÔNG chào lại nếu đã có lịch sử hội thoại.
• Câu hỏi mơ hồ → hỏi lại 1 câu ngắn gọn thay vì đoán sai.

═══════════════════════════════════════════
LỊCH SỬ HỘI THOẠI GẦN ĐÂY
═══════════════════════════════════════════
${conversationHistory || '(Đây là tin nhắn đầu tiên)'}`;
}
