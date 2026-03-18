// ================= USERS =================
export const users = [
  {
    id: "u1",
    username: "admin",
    email: "admin@gmail.com",
    role: "admin",
    status: "active",
    avatar_url: "https://i.pravatar.cc/150?img=1",
    created_at: "2026-03-01",
  },
  {
    id: "u2",
    username: "hao",
    email: "hao@gmail.com",
    role: "user",
    status: "active",
    avatar_url: "https://i.pravatar.cc/150?img=2",
    created_at: "2026-03-02",
  },
  {
    id: "u3",
    username: "user2",
    email: "user2@gmail.com",
    role: "user",
    status: "active",
    avatar_url: "https://i.pravatar.cc/150?img=3",
    created_at: "2026-03-03",
  },
];

// ================= CATEGORY =================
export const categories = [
  { id: "c1", name: "Chocolate", created_at: "2026-03-01" },
  { id: "c2", name: "Candy", created_at: "2026-03-01" },
  { id: "c3", name: "Snack", created_at: "2026-03-01" },
];

// ================= BRAND =================
export const brands = [
  {
    id: "b1",
    name: "KitKat",
    logo_url: "https://logo.clearbit.com/kitkat.com",
    created_at: "2026-03-01",
  },
  {
    id: "b2",
    name: "Oreo",
    logo_url: "https://logo.clearbit.com/oreo.com",
    created_at: "2026-03-01",
  },
  {
    id: "b3",
    name: "Snickers",
    logo_url: "https://logo.clearbit.com/snickers.com",
    created_at: "2026-03-01",
  },
];

// ================= PRODUCTS (NHIỀU DATA) =================
export const products = [
  {
    id: "p1",
    name: "KitKat 4 Fingers",
    description: "Chocolate wafer bar",
    price: 20000,          // giá gốc
    sale_price: 18000,     // đang giảm
    stock: 100,
    image_url: "https://picsum.photos/200?1",
    category_id: "c1",
    brand_id: "b1",
    weight: [35, 70],
    weight_unit: "g",
    package_type: "box",
    is_active: true,
    created_at: "2026-03-01",
  },
  {
    id: "p2",
    name: "KitKat Chunky",
    description: "Big chocolate bar",
    price: 25000,
    sale_price: null,      // không giảm
    stock: 80,
    image_url: "https://picsum.photos/200?2",
    category_id: "c1",
    brand_id: "b1",
    weight: [50],
    weight_unit: "g",
    package_type: "pack",
    is_active: true,
    created_at: "2026-03-01",
  },
  {
    id: "p3",
    name: "Oreo Original",
    description: "Chocolate sandwich cookies with cream filling and a hint of vanilla flavor in the cream. The cookies are made with cocoa and have a crisp texture that complements the smooth and sweet cream filling. The combination of the chocolatey cookies and the creamy filling creates a delicious and satisfying treat that is perfect for snacking or enjoying with a glass of milk. Oreo Original is a classic and beloved cookie that has been enjoyed by people of all ages for generations.",
    price: 30000,
    sale_price: 27000,     // giảm nhẹ
    stock: 50,
    image_url: "https://picsum.photos/200?3",
    category_id: "c2",
    brand_id: "b2",
    weight: [133],
    weight_unit: "g",
    package_type: "pack",
    is_active: true,
    created_at: "2026-03-01",
  },
  {
    id: "p4",
    name: "Oreo Chocolate Cream",
    description: "Chocolate cream cookies",
    price: 32000,
    sale_price: null,      // không giảm
    stock: 60,
    image_url: "https://picsum.photos/200?4",
    category_id: "c2",
    brand_id: "b2",
    weight: [133],
    weight_unit: "g",
    package_type: "pack",
    is_active: true,
    created_at: "2026-03-02",
  },
  {
    id: "p5",
    name: "Snickers Bar",
    description: "Peanut chocolate bar",
    price: 22000,
    sale_price: 19000,     // giảm
    stock: 120,
    image_url: "https://picsum.photos/200?5",
    category_id: "c1",
    brand_id: "b3",
    weight: [45],
    weight_unit: "g",
    package_type: "bar",
    is_active: true,
    created_at: "2026-03-02",
  },
  {
    id: "p6",
    name: "Snickers Mini Pack",
    description: "Mini chocolate pack",
    price: 50000,
    sale_price: 42000,     // giảm khá mạnh
    stock: 40,
    image_url: "https://picsum.photos/200?6",
    category_id: "c1",
    brand_id: "b3",
    weight: [200],
    weight_unit: "g",
    package_type: "box",
    is_active: true,
    created_at: "2026-03-02",
  },
  {
    id: "p7",
    name: "Gummy Bears",
    description: "Fruit gummy candy",
    price: 15000,
    sale_price: null,      // không giảm
    stock: 200,
    image_url: "https://picsum.photos/200?7",
    category_id: "c2",
    brand_id: "b2",
    weight: [100],
    weight_unit: "g",
    package_type: "pack",
    is_active: true,
    created_at: "2026-03-03",
  },
  {
    id: "p8",
    name: "Potato Chips",
    description: "Crispy snack",
    price: 18000,
    sale_price: 16000,     // giảm nhẹ
    stock: 150,
    image_url: "https://picsum.photos/200?8",
    category_id: "c3",
    brand_id: "b3",
    weight: [120],
    weight_unit: "g",
    package_type: "bag",
    is_active: true,
    created_at: "2026-03-03",
  },
];

// ================= PRODUCT IMAGES =================
export const productImages = [
  { id: "pi1", product_id: "p1", image_url: "https://picsum.photos/200?11", created_at: "2026-03-01" },
  { id: "pi2", product_id: "p1", image_url: "https://picsum.photos/200?12", created_at: "2026-03-01" },
  { id: "pi3", product_id: "p3", image_url: "https://picsum.photos/200?13", created_at: "2026-03-01" },
];

// ================= CART =================
export const carts = [
  { id: "cart1", user_id: "u2", created_at: "2026-03-10" },
];

// ================= CART ITEMS =================
export const cartItems = [
  { id: "ci1", cart_id: "cart1", product_id: "p1", quantity: 2, price: 20000 },
  { id: "ci2", cart_id: "cart1", product_id: "p3", quantity: 1, price: 30000 },
  { id: "ci3", cart_id: "cart1", product_id: "p5", quantity: 3, price: 22000 },
];

// ================= ORDERS =================
export const orders = [
  {
    id: "o1",
    user_id: "u2",
    total_amount: 70000,
    status: "PENDING",
    receiver_name: "Hao",
    receiver_phone: "0123456789",
    shipping_address: "HCM City",
    shipping_fee: 15000,
    payment_method: "COD",
    created_at: "2026-03-12",
  },
  {
    id: "o2",
    user_id: "u3",
    total_amount: 50000,
    status: "DELIVERED",
    receiver_name: "User 2",
    receiver_phone: "0987654321",
    shipping_address: "Hanoi",
    shipping_fee: 15000,
    payment_method: "BANK",
    created_at: "2026-03-11",
  },
];

// ================= ORDER ITEMS =================
export const orderItems = [
  { id: "oi1", order_id: "o1", product_id: "p1", quantity: 2, price: 20000 },
  { id: "oi2", order_id: "o1", product_id: "p3", quantity: 1, price: 30000 },
  { id: "oi3", order_id: "o2", product_id: "p5", quantity: 2, price: 22000 },
];

// ================= PAYMENTS =================
export const payments = [
  {
    id: "pay1",
    order_id: "o1",
    payment_method: "COD",
    payment_status: "PENDING",
    amount: 70000,
    created_at: "2026-03-12",
  },
];

// ================= REVIEWS =================
export const reviews = [
  {
    id: "r1",
    user_id: "u2",
    product_id: "p1",
    rating: 5,
    comment: "Rất ngon",
    created_at: "2026-03-13",
  },
  {
    id: "r2",
    user_id: "u3",
    product_id: "p3",
    rating: 4,
    comment: "Ổn",
    created_at: "2026-03-13",
  },
];

// ================= COUPONS =================
export const coupons = [
  {
    id: "cp1",
    code: "SALE10",
    discount_percent: 10,
    min_order_amount: 50000,
    max_discount_amount: 20000,
    usage_limit: 100,
    used_count: 10,
    expiry_date: "2026-04-01",
    created_at: "2026-03-01",
  },
];

// ================= WISHLIST =================
export const wishlists = [
  { id: "w1", user_id: "u2", created_at: "2026-03-10" },
];

// ================= WISHLIST ITEMS =================
export const wishlistItems = [
  { id: "wi1", wishlist_id: "w1", product_id: "p2", created_at: "2026-03-10" },
  { id: "wi2", wishlist_id: "w1", product_id: "p4", created_at: "2026-03-10" },
];

// ================= BANNERS =================
export const banners = [
  {
    id: "bn1",
    description: "Sale KitKat up to 20%",
    image_url: "https://picsum.photos/800/300?1",
    link: "/products?p=p1",
    product_id: "p1",
    is_active: true,
    created_at: "2026-03-01",
  },
  {
    id: "bn2",
    description: "Oreo special offer",
    image_url: "https://picsum.photos/800/300?2",
    link: "/products?p=p3",
    product_id: "p3",
    is_active: true,
    created_at: "2026-03-01",
  },
  {
    id: "bn3",
    description: "Snickers hot deal",
    image_url: "https://picsum.photos/800/300?3",
    link: "/products?p=p5",
    product_id: "p5",
    is_active: true,
    created_at: "2026-03-02",
  },
  {
    id: "bn4",
    description: "Chocolate collection",
    image_url: "https://picsum.photos/800/300?4",
    link: "/products?category=c1",
    product_id: null,
    is_active: true,
    created_at: "2026-03-02",
  },
  {
    id: "bn5",
    description: "Cookies & Biscuits",
    image_url: "https://picsum.photos/800/300?5",
    link: "/products?category=c2",
    product_id: null,
    is_active: true,
    created_at: "2026-03-02",
  },
  {
    id: "bn6",
    description: "Snack sale weekend",
    image_url: "https://picsum.photos/800/300?6",
    link: "/products?category=c3",
    product_id: null,
    is_active: true,
    created_at: "2026-03-03",
  },
  {
    id: "bn7",
    description: "Limited KitKat combo",
    image_url: "https://picsum.photos/800/300?7",
    link: "/products?p=p2",
    product_id: "p2",
    is_active: true,
    created_at: "2026-03-03",
  },
  {
    id: "bn8",
    description: "Best seller Oreo",
    image_url: "https://picsum.photos/800/300?8",
    link: "/products?p=p4",
    product_id: "p4",
    is_active: true,
    created_at: "2026-03-03",
  },
  {
    id: "bn9",
    description: "Gummy candy for kids",
    image_url: "https://picsum.photos/800/300?9",
    link: "/products?p=p7",
    product_id: "p7",
    is_active: false, // test inactive
    created_at: "2026-03-04",
  },
  {
    id: "bn10",
    description: "Hot chips deal",
    image_url: "https://picsum.photos/800/300?10",
    link: "/products?p=p8",
    product_id: "p8",
    is_active: true,
    created_at: "2026-03-04",
  },
];