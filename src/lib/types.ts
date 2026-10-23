// Core domain types for the VRUNDORA jewellery store

export type CategorySlug =
  | "earrings"
  | "necklaces"
  | "rings"
  | "bracelets"
  | "bangles"
  | "anklets"
  | "sets"
  | "hair";

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  tagline: string;
  image: string;
  subcategories: SubCategory[];
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Gold-tone", "Silver-tone"
  color: string; // hex
  stock: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  status?: "pending" | "approved" | "rejected";
  adminReply?: string;
  adminReplyDate?: string;
  productName?: string;
  productId?: string;
}

export type ProductType = "single" | "combo";

export interface ComboComponent {
  componentProductId: string;
  componentVariantId?: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: CategorySlug;
  subcategory: string;
  collection: string;
  price: number;
  mrp: number;
  images: string[];
  colors: ProductVariant[];
  sizes: string[];
  material: string;
  weight: string;
  dimensions: string;
  care: string;
  description: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  tags: string[];
  badges: ProductBadge[];
  stock: number;
  bestseller: boolean;
  newArrival: boolean;
  featured: boolean;
  productType?: ProductType;
  comboComponents?: ComboComponent[];
  status?: "active" | "draft";
}

export type ProductBadge =
  | "new"
  | "bestseller"
  | "sale"
  | "low-stock"
  | "out-of-stock"
  | "combo";

export interface CartItem {
  productId: string;
  qty: number;
  colorId: string;
  size?: string;
  savedForLater: boolean;
}

export interface Address {
  id: string;
  label: "Home" | "Work" | "Other";
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentMethod = "card" | "upi" | "cod" | "wallet";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface OrderItemComponentSnapshot {
  productId: string;
  name: string;
  sku: string;
  image: string;
  qty: number;
  price: number;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  colorId: string;
  colorName: string;
  size?: string;
  isCombo?: boolean;
  comboComponents?: OrderItemComponentSnapshot[];
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  date: string;
  location: string;
  done: boolean;
}

export interface Order {
  id: string;
  number: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  address: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingNumber?: string;
  courier?: string;
  placedAt: string;
  estimatedDelivery: string;
  timeline: OrderTimelineEvent[];
}

export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  expiresOn: string;
}

export interface Notification {
  id: string;
  type: "order" | "promo" | "system";
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

// UI navigation
export type ViewName =
  | "home"
  | "shop"
  | "product"
  | "cart"
  | "wishlist"
  | "checkout"
  | "order-success"
  | "orders"
  | "order-details"
  | "account"
  | "addresses"
  | "notifications"
  | "support"
  | "login"
  | "register"
  | "admin";

export interface NavParams {
  [key: string]: string | undefined;
}
