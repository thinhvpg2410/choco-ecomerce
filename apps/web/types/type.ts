// ================= USER =================
export type UserRole = "admin" | "user";

export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar_url?: string;
  status: UserStatus;
  created_at: string;
}

// ================= CATEGORY =================
export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

// ================= BRAND =================
export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: string;
}

// ================= PRODUCT =================
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number | null;
  stock: number;

  image_url: string;

  category_id: string;
  brand_id: string;

  weight: number[];
  weight_unit: string;
  package_type: string;

  is_active: boolean;
  created_at: string;
}

// ================= PRODUCT IMAGE =================
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  created_at: string;
}

// ================= ORDER =================
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  user_id: string;
  coupon_id?: string;

  total_amount: number;
  status: OrderStatus;

  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  note?: string;

  shipping_fee: number;
  payment_method: string;

  created_at: string;
}

// ================= ORDER ITEM =================
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// ================= PAYMENT =================
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  payment_status: PaymentStatus;
  transaction_code?: string;
  amount: number;
  paid_at?: string;
  created_at: string;
}

// ================= REVIEW =================
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// ================= COUPON =================
export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  used_count: number;
  expiry_date: string;
  created_at: string;
}

// ================= CART =================
export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
}

// ================= CART ITEM =================
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// // ================= WISHLIST =================
// export interface Wishlist {
//   id: string;
//   user_id: string;
//   created_at: string;
// }

// // ================= WISHLIST ITEM =================
// export interface WishlistItem {
//   id: string;
//   wishlist_id: string;
//   product_id: string;
//   created_at: string;
// }

// ================= BANNER =================
export interface Banner {
  id: string;
  description?: string;

  image_url: string;

  product_id?: string;

  is_active: boolean;

  created_at: string;
}

