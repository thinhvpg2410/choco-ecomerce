// ================= USER =================
export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string; // Số điện thoại liên hệ
  dob?: string; // Ngày sinh (có thể dùng cho khuyến mãi sinh nhật)
  gender?: "male" | "female" | "other";
  avatar_url?: string;
  refresh_token_hash: string; // Dùng để quản lý phiên đăng nhập
  status: UserStatus;
  created_at: string;
  updated_at?: string; // Theo dõi khi nào thông tin user được cập nhật
}

// ================= USER ADDRESS =================
export interface UserAddress {
  id: string;
  user_id: string;
  receiver_name: string; // Tên người nhận
  receiver_phone: string; // SĐT người nhận
  address: string; // Địa chỉ chi tiết
  ward: string; // Phường/Xã
  district: string; // Quận/Huyện
  city: string; // Tỉnh/Thành phố
  created_at: string;
  updated_at?: string;
}

// ================= CATEGORY =================
export interface Category {
  id: string;
  name: string;
  slug: string; // URL thân thiện: /danh-muc/socola
  description?: string;
  image_url?: string; // Ảnh đại diện cho danh mục (hiển thị trên homepage & menu)
  parent_id?: string; // Hỗ trợ danh mục con (Bánh kẹo > Socola > Socola đen)
  sort_order?: number; // Thứ tự hiển thị
  is_active: boolean; // Bật/tắt danh mục
  created_at: string;
  updated_at?: string;
}

// ================= BRAND =================
export interface Brand {
  id: string;
  name: string;
  slug: string; // URL thân thiện
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// ================= PRODUCT=================
export interface Product {
  id: string;
  name: string;
  slug: string; // URL thân thiện: /san-pham/banh-keo-chocolate-500g
  short_description?: string; // Mô tả ngắn hiển thị trên danh sách sản phẩm
  description: string; // Mô tả chi tiết (HTML hoặc Markdown)

  sku: string; // Mã sản phẩm riêng biệt (rất quan trọng cho quản lý kho)

  price: number; // Giá gốc
  sale_price?: number | null; // Giá khuyến mãi
  cost_price?: number; // Giá vốn (dùng để tính lợi nhuận cho admin)

  stock: number; // Số lượng tồn kho

  image_url: string; // Ảnh chính (thumbnail)
  product_images?: ProductImage[];

  category_id: string;
  brand_id: string;

  // === Thông tin đặc thù cho bánh kẹo & thực phẩm ===
  ingredients?: string; // Thành phần (text dài)
  nutrition_info?: Record<string, any>; // Thông tin dinh dưỡng dạng JSON
  // Ví dụ: { calories: 450, protein: 8, sugar: 25, ... }

  origin?: string; // Xuất xứ: "Việt Nam", "Nhật Bản", "Đức", "Mỹ"...

  weight: number; // Trọng lượng (đổi từ number[] → number cho dễ dùng)
  weight_unit: string; // "g", "kg"

  package_type: string; // "Hộp giấy", "Túi zip", "Lon", "Hũ nhựa"...

  // === Tối ưu hiển thị & Marketing ===
  is_active: boolean;
  is_featured: boolean; // Sản phẩm nổi bật trên Homepage
  is_best_seller: boolean; // Sản phẩm bán chạy
  is_new: boolean; // Hàng mới về

  created_at: string;
  updated_at?: string;

  // Quan hệ — backend đã trả về trong toProductResponse()
  category?: { id: string; name: string };
  brand?: { id: string; name: string };

  // Đánh giá
  average_rating?: number; // Điểm đánh giá trung bình từ review
  review_count?: number; // Số lượng đánh giá đã nhận
}

// ================= PRODUCT IMAGE =================
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order?: number; // Thứ tự hiển thị ảnh (ảnh 1, ảnh 2...)
  is_main?: boolean; // Ảnh chính (có thể thay thế image_url trong Product)
  created_at: string;
}



// ================= ORDER =================
export interface Order {
  id: string;
  user_id: string;
  coupon_id?: string;

  total_amount: number; // Tổng tiền sản phẩm
  shipping_fee: number;
  discount_amount?: number; // Tiền được giảm từ coupon
  final_amount: number; // Tổng tiền phải thanh toán (total + ship - discount)

  status: OrderStatus;
  payment_status?: PaymentStatus; // Đồng bộ trạng thái thanh toán

  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  ward?: string;
  district?: string;
  city?: string;

  note?: string;
  cancel_reason?: string; // Lý do hủy đơn (nếu bị hủy)

  created_at: string;
  updated_at?: string;
}

// ================= ORDER ITEM =================
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name_at_time: string; // Lưu lại tên sản phẩm lúc mua (phòng khi tên thay đổi)
  product_image_at_time?: string; // Lưu ảnh lúc mua

  quantity: number;
  price: number; // Giá lúc mua
  sale_price?: number;
}

// ================= PAYMENT =================
export interface Payment {
  id: string;
  order_id: string;
  payment_method: string; // "COD", "VNPay", "Momo", "BankTransfer", "ZaloPay"...
  payment_status: PaymentStatus;
  transaction_code?: string;
  amount: number;
  paid_at?: string; //thanh toán lúc nào
  created_at: string;
}

// ================= REVIEW =================
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_item_id?: string; // Liên kết với đơn hàng để tránh review giả

  rating: number; // 1 - 5 sao
  comment?: string;

  is_active: boolean; // Ẩn hiện review (dùng cho quản lý nội dung)

  created_at: string;
}

// ================= COUPON =================
export interface Coupon {
  id: string;
  code: string;
  coupon_type: "PERCENT" | "FIXED" | "FREE_SHIP"; // Loại coupon

  discount_percent?: number; // Dùng khi type = PERCENT (0-100)
  discount_amount?: number; // Dùng khi type = FIXED

  min_order_amount: number; // Đơn tối thiểu để áp dụng
  max_discount_amount?: number; // Giới hạn tiền giảm tối đa

  usage_limit: number; // Tổng số lần dùng
  used_count: number; // Đã dùng bao nhiêu lần
  per_user_limit?: number; // Giới hạn mỗi user dùng bao nhiêu lần

  expiry_date?: string; // Ngày hết hạn (null = vô thời hạn)
  is_active: boolean;

  applicable_categories?: string[]; // Áp dụng cho danh mục nào (nếu có)
  applicable_products?: string[]; // Áp dụng cho sản phẩm cụ thể

  created_at: string;
  updated_at?: string;
}


export interface CartApiResponse {
  success: boolean;
  message: string;
  data: CartData;
}

export interface CartData {
  user_id: string;
  items: CartItemResponse[];
  total_amount: number;
  updatedAt?: string;
}

export interface CartItemResponse {
  product_id: string;
  quantity: number;
  price: number;
  subtotal?: number;      
}


export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at?: string;
}

// ================= BANNER =================
export interface Banner {
  id: string;
  description?: string;
  image_url: string;
  product_id?: string; // Nếu link đến sản phẩm
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
}

// ================= ORDER STATUS & PAYMENT STATUS (Giữ nguyên) =================
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"; // Thêm trạng thái trả hàng

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
