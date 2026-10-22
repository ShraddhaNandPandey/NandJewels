"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Address,
  CartItem,
  Coupon,
  Notification,
  Order,
  OrderItemComponentSnapshot,
  OrderItemSnapshot,
  OrderStatus,
  PaymentMethod,
  Product,
  Review,
  SupportTicket,
  User,
  ViewName,
} from "@/lib/types";
import { getProduct, products as allProducts, calculateComboStock, setProductStoreGetter } from "@/data/products";
import { applyCouponDiscount, coupons as defaultCoupons } from "@/data/coupons";

export interface ToastMsg {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  freeShippingThreshold: number;
  taxRate: number;
  address?: string;
}

export interface AdminRoleUser {
  id: string;
  name: string;
  email: string;
  role: string;
  perms: string;
}

interface StoreState {
  // navigation
  view: ViewName;
  params: Record<string, string | undefined>;
  navigate: (view: ViewName, params?: Record<string, string | undefined>) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // auth
  user: User | null;
  login: (email: string) => void;
  register: (data: Omit<User, "id" | "createdAt">) => void;
  logout: () => void;

  // cart
  cart: CartItem[];
  addToCart: (productId: string, qty?: number, colorId?: string, size?: string) => void;
  updateQty: (productId: string, colorId: string, qty: number, size?: string) => void;
  removeFromCart: (productId: string, colorId: string, size?: string) => void;
  saveForLater: (productId: string, colorId: string, saved: boolean, size?: string) => void;
  clearCart: () => void;

  // wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // coupon
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string, subtotal: number) => { ok: boolean; message: string };
  removeCoupon: () => void;

  // addresses
  addresses: Address[];
  addAddress: (a: Omit<Address, "id">) => void;
  updateAddress: (id: string, a: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // orders
  orders: Order[];
  placeOrder: (data: {
    address: Address;
    paymentMethod: PaymentMethod;
    shipping: number;
    tax: number;
  }) => Order;
  cancelOrder: (orderId: string) => void;
  advanceOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  requestReturn: (orderId: string, reason: string) => void;

  // notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "date" | "read">) => void;

  // support tickets
  tickets: SupportTicket[];
  createTicket: (t: Omit<SupportTicket, "id" | "createdAt" | "status">) => void;

  // recently viewed
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  // products management
  products: Product[];
  addProduct: (p: Omit<Product, "id"> & { id?: string }) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // coupons management
  coupons: Coupon[];
  addCoupon: (c: Coupon) => void;
  deleteCoupon: (code: string) => void;

  // reviews management
  reviews: Review[];
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  replyReview: (reviewId: string, reply: string) => void;

  // store settings
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;

  // admin users
  adminUsers: AdminRoleUser[];
  addAdminUser: (u: Omit<AdminRoleUser, "id">) => void;
  deleteAdminUser: (id: string) => void;

  // toasts
  toasts: ToastMsg[];
  pushToast: (t: Omit<ToastMsg, "id">) => void;
  dismissToast: (id: string) => void;
}

const initialReviews: Review[] = allProducts.flatMap((p) =>
  p.reviews.map((r) => ({
    ...r,
    productId: p.id,
    productName: p.name,
    status: (r.verified ? "approved" : "pending") as "pending" | "approved" | "rejected",
  }))
);

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function orderNumber() {
  const n = Math.floor(Math.random() * 900000 + 100000);
  return `ORD-2026-${n}`;
}

const orderStatusFlow: OrderStatus[] = [
  "placed",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const statusLabels: Record<OrderStatus, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

function buildTimeline(status: OrderStatus) {
  const now = new Date();
  const currentIndex = orderStatusFlow.indexOf(status);
  return orderStatusFlow
    .filter((s) => s !== "cancelled" && s !== "returned")
    .map((s, i) => {
      const date = new Date(now.getTime() + i * 1000 * 60 * 60 * 12);
      return {
        status: s,
        label: statusLabels[s],
        date: date.toISOString(),
        location: i <= currentIndex ? "Mumbai Hub" : undefined as unknown as string,
        done: i <= currentIndex,
      };
    });
}

const initialOrders: Order[] = [
  {
    id: "ord-10492",
    number: "ORD-2026-287530",
    items: [
      {
        productId: allProducts[0].id,
        name: allProducts[0].name,
        image: allProducts[0].images[0],
        price: allProducts[0].price,
        qty: 1,
        colorId: allProducts[0].colors[0]?.id || "gold",
        colorName: allProducts[0].colors[0]?.name || "Yellow Gold",
      },
      {
        productId: allProducts[1].id,
        name: allProducts[1].name,
        image: allProducts[1].images[0],
        price: allProducts[1].price,
        qty: 1,
        colorId: allProducts[1].colors[0]?.id || "rose",
        colorName: allProducts[1].colors[0]?.name || "Rose Gold",
      },
    ],
    subtotal: allProducts[0].price + allProducts[1].price,
    discount: 250,
    shipping: 0,
    tax: Math.round((allProducts[0].price + allProducts[1].price - 250) * 0.03),
    total: allProducts[0].price + allProducts[1].price - 250 + Math.round((allProducts[0].price + allProducts[1].price - 250) * 0.03),
    couponCode: "WELCOME10",
    address: {
      id: "addr-delhi",
      label: "Home",
      name: "Kavita Sen",
      phone: "9811234567",
      line1: "A-42, Defence Colony",
      line2: "Near Flyover Market",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110024",
      country: "India",
      isDefault: true,
    },
    paymentMethod: "upi",
    paymentStatus: "paid",
    status: "placed",
    trackingNumber: "SEQ-DEL-894120",
    courier: "Sequel 24K Secure Logistics",
    placedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    timeline: buildTimeline("placed"),
  },
  {
    id: "ord-10488",
    number: "ORD-2026-287412",
    items: [
      {
        productId: allProducts[2].id,
        name: allProducts[2].name,
        image: allProducts[2].images[0],
        price: allProducts[2].price,
        qty: 1,
        colorId: allProducts[2].colors[0]?.id || "diamond",
        colorName: allProducts[2].colors[0]?.name || "Diamond Solitaire",
      },
    ],
    subtotal: allProducts[2].price,
    discount: 0,
    shipping: 0,
    tax: Math.round(allProducts[2].price * 0.03),
    total: allProducts[2].price + Math.round(allProducts[2].price * 0.03),
    address: {
      id: "addr-hyd",
      label: "Work",
      name: "Rohan Gupta",
      phone: "9949012345",
      line1: "Flat 702, Cyber Towers View",
      line2: "Hitec City, Madhapur",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      country: "India",
      isDefault: true,
    },
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "confirmed",
    trackingNumber: "BLU-HYD-510294",
    courier: "BlueDart Apex Express",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    timeline: buildTimeline("confirmed"),
  },
  {
    id: "ord-10475",
    number: "ORD-2026-287341",
    items: [
      {
        productId: allProducts[4].id,
        name: allProducts[4].name,
        image: allProducts[4].images[0],
        price: allProducts[4].price,
        qty: 1,
        colorId: allProducts[4].colors[0]?.id || "gold",
        colorName: allProducts[4].colors[0]?.name || "Yellow Gold",
      },
    ],
    subtotal: allProducts[4].price,
    discount: 200,
    shipping: 0,
    tax: Math.round((allProducts[4].price - 200) * 0.03),
    total: allProducts[4].price - 200 + Math.round((allProducts[4].price - 200) * 0.03),
    couponCode: "AURELLE200",
    address: {
      id: "addr-mum",
      label: "Home",
      name: "Priya Sharma",
      phone: "9820098200",
      line1: "12 Hill Road, Bandra West",
      line2: "Near Mehboob Studio",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      country: "India",
      isDefault: true,
    },
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "processing",
    trackingNumber: "DEL-MUM-773419",
    courier: "Delhivery Secure Express",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    timeline: buildTimeline("processing"),
  },
  {
    id: "ord-10462",
    number: "ORD-2026-287205",
    items: [
      {
        productId: allProducts[5].id,
        name: allProducts[5].name,
        image: allProducts[5].images[0],
        price: allProducts[5].price,
        qty: 1,
        colorId: allProducts[5].colors[0]?.id || "gold",
        colorName: allProducts[5].colors[0]?.name || "Yellow Gold",
      },
    ],
    subtotal: allProducts[5].price,
    discount: 0,
    shipping: 0,
    tax: Math.round(allProducts[5].price * 0.03),
    total: allProducts[5].price + Math.round(allProducts[5].price * 0.03),
    address: {
      id: "addr-blr",
      label: "Home",
      name: "Ananya Reddy",
      phone: "9845012345",
      line1: "45 Brigade Road, Ashok Nagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      country: "India",
      isDefault: true,
    },
    paymentMethod: "upi",
    paymentStatus: "paid",
    status: "shipped",
    trackingNumber: "SEQ-BLR-381902",
    courier: "Sequel 24K Secure Logistics",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    timeline: buildTimeline("shipped"),
  },
  {
    id: "ord-10450",
    number: "ORD-2026-287118",
    items: [
      {
        productId: allProducts[7].id,
        name: allProducts[7].name,
        image: allProducts[7].images[0],
        price: allProducts[7].price,
        qty: 2,
        colorId: allProducts[7].colors[0]?.id || "silver",
        colorName: allProducts[7].colors[0]?.name || "Silver-tone",
      },
    ],
    subtotal: allProducts[7].price * 2,
    discount: 300,
    shipping: 0,
    tax: Math.round((allProducts[7].price * 2 - 300) * 0.03),
    total: allProducts[7].price * 2 - 300 + Math.round((allProducts[7].price * 2 - 300) * 0.03),
    address: {
      id: "addr-chn",
      label: "Home",
      name: "Meera Krishnan",
      phone: "9840012345",
      line1: "8 T Nagar, South Boag Road",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600017",
      country: "India",
      isDefault: true,
    },
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "delivered",
    trackingNumber: "BLU-CHN-194821",
    courier: "BlueDart Apex Express",
    placedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    estimatedDelivery: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    timeline: buildTimeline("delivered"),
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      view: "home",
      params: {},
      navigate: (view, params = {}) => {
        set({ view, params, mobileMenuOpen: false });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      user: null,
      login: (email) => {
        const user: User = {
          id: uid("usr"),
          firstName: "Shraddhanand",
          lastName: "Member",
          email,
          phone: "+91 98765 43210",
          createdAt: new Date().toISOString(),
        };
        set({ user });
        get().pushToast({ title: "Welcome back!", description: "You're now logged in.", variant: "success" });
      },
      register: (data) => {
        const user: User = { ...data, id: uid("usr"), createdAt: new Date().toISOString() };
        set({ user });
        get().pushToast({ title: "Account created", description: "Welcome to Shraddhanand.", variant: "success" });
      },
      logout: () => {
        set({ user: null, view: "home" });
        get().pushToast({ title: "Logged out", description: "See you soon." });
      },

      cart: [],
      addToCart: (productId, qty = 1, colorId, size) => {
        const productList = get().products || allProducts;
        const product = productList.find((p) => p.id === productId || p.slug === productId) || getProduct(productId);
        if (!product) return;

        const availableStock = product.productType === "combo"
          ? calculateComboStock(product.comboComponents, productList)
          : product.stock;

        if (availableStock <= 0) {
          get().pushToast({
            title: "Out of Stock",
            description: `${product.name} is currently out of stock.`,
            variant: "destructive",
          });
          return;
        }

        const cid = colorId || product.colors?.[0]?.id || "default";
        const cart = [...get().cart];
        const existing = cart.find(
          (i) => i.productId === product.id && i.colorId === cid && i.size === size && !i.savedForLater
        );
        const currentQtyInCart = existing ? existing.qty : 0;
        if (currentQtyInCart + qty > availableStock) {
          get().pushToast({
            title: "Stock Limit Reached",
            description: `Only ${availableStock} units available for ${product.name}.`,
            variant: "destructive",
          });
          if (existing) {
            existing.qty = availableStock;
            set({ cart });
          }
          return;
        }

        if (existing) {
          existing.qty += qty;
        } else {
          cart.push({ productId: product.id, qty, colorId: cid, size, savedForLater: false });
        }
        set({ cart });
        get().pushToast({ title: "Added to cart", description: product.name, variant: "success" });
      },
      updateQty: (productId, colorId, qty, size) => {
        if (qty < 1) return;
        const productList = get().products || allProducts;
        const product = productList.find((p) => p.id === productId || p.slug === productId) || getProduct(productId);
        if (product) {
          const availableStock = product.productType === "combo"
            ? calculateComboStock(product.comboComponents, productList)
            : product.stock;
          if (qty > availableStock) {
            get().pushToast({
              title: "Stock limit reached",
              description: `Only ${availableStock} units available.`,
              variant: "destructive",
            });
            qty = Math.max(1, availableStock);
          }
        }
        set({
          cart: get().cart.map((i) =>
            i.productId === productId && i.colorId === colorId && !i.savedForLater
              ? { ...i, qty }
              : i
          ),
        });
      },
      removeFromCart: (productId, colorId) => {
        set({ cart: get().cart.filter((i) => !(i.productId === productId && i.colorId === colorId)) });
        get().pushToast({ title: "Removed from cart" });
      },
      saveForLater: (productId, colorId, saved) => {
        set({
          cart: get().cart.map((i) =>
            i.productId === productId && i.colorId === colorId ? { ...i, savedForLater: saved } : i
          ),
        });
      },
      clearCart: () => set({ cart: [], couponCode: null, couponDiscount: 0 }),

      wishlist: [],
      toggleWishlist: (productId) => {
        const product = getProduct(productId);
        const wl = get().wishlist;
        if (wl.includes(productId)) {
          set({ wishlist: wl.filter((id) => id !== productId) });
          get().pushToast({ title: "Removed from wishlist" });
        } else {
          set({ wishlist: [...wl, productId] });
          get().pushToast({ title: "Added to wishlist", description: product?.name, variant: "success" });
        }
      },
      isWishlisted: (productId) => get().wishlist.includes(productId),

      couponCode: null,
      couponDiscount: 0,
      applyCoupon: (code, subtotal) => {
        const couponsList = get().coupons?.length ? get().coupons : defaultCoupons;
        const coupon = couponsList.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
        if (!coupon) return { ok: false, message: "Invalid coupon code." };
        const today = new Date();
        if (new Date(coupon.expiresOn) < today)
          return { ok: false, message: "This coupon has expired." };
        if (subtotal < coupon.minOrder)
          return {
            ok: false,
            message: `Add items worth ₹${coupon.minOrder - subtotal} more to use this coupon.`,
          };
        const discount = applyCouponDiscount(coupon, subtotal);
        set({ couponCode: coupon.code, couponDiscount: discount });
        get().pushToast({ title: "Coupon applied", description: coupon.description, variant: "success" });
        return { ok: true, message: "Coupon applied" };
      },
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      addresses: [
        {
          id: uid("addr"),
          label: "Home",
          name: "Shraddhanand Member",
          phone: "+91 98765 43210",
          line1: "12 Jasmine Heights, Linking Road",
          line2: "Flat 4B",
          landmark: "Near Bandra Fire Station",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400050",
          country: "India",
          isDefault: true,
        },
      ],
      addAddress: (a) => {
        const address = { ...a, id: uid("addr") };
        const addresses = [...get().addresses];
        if (address.isDefault) addresses.forEach((x) => (x.isDefault = false));
        addresses.push(address);
        set({ addresses });
        get().pushToast({ title: "Address added", variant: "success" });
      },
      updateAddress: (id, patch) => {
        const addresses = get().addresses.map((a) => (a.id === id ? { ...a, ...patch } : a));
        if (patch.isDefault) addresses.forEach((a) => { if (a.id !== id) a.isDefault = false; });
        set({ addresses });
        get().pushToast({ title: "Address updated", variant: "success" });
      },
      removeAddress: (id) => {
        set({ addresses: get().addresses.filter((a) => a.id !== id) });
        get().pushToast({ title: "Address removed" });
      },
      setDefaultAddress: (id) => {
        set({
          addresses: get().addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        });
      },

      orders: initialOrders,
      placeOrder: ({ address, paymentMethod, shipping, tax }) => {
        const cart = get().cart.filter((i) => !i.savedForLater);
        const productList = get().products || allProducts;
        const updatedProducts = [...productList];

        const items: OrderItemSnapshot[] = cart.map((i) => {
          const p = updatedProducts.find((x) => x.id === i.productId) || (getProduct(i.productId) as Product);
          const color = p.colors?.find((c) => c.id === i.colorId);
          const isCombo = p.productType === "combo";

          let comboComponentsSnapshot: OrderItemComponentSnapshot[] | undefined = undefined;
          if (isCombo && p.comboComponents && p.comboComponents.length > 0) {
            comboComponentsSnapshot = p.comboComponents.map((cc) => {
              const compProduct = updatedProducts.find((item) => item.id === cc.componentProductId);
              return {
                productId: cc.componentProductId,
                name: compProduct?.name || "Component Item",
                sku: compProduct?.sku || "SKU-N/A",
                image: compProduct?.images?.[0] || p.images[0],
                qty: cc.quantity * i.qty,
                price: compProduct?.price || 0,
              };
            });

            // Deduct stock from individual component products
            p.comboComponents.forEach((cc) => {
              const compIdx = updatedProducts.findIndex((item) => item.id === cc.componentProductId);
              if (compIdx !== -1) {
                const target = updatedProducts[compIdx];
                const deductQty = cc.quantity * i.qty;
                const newStock = Math.max(0, (target.stock || 0) - deductQty);
                const updatedColors = target.colors?.map((col) => ({
                  ...col,
                  stock: Math.max(0, col.stock - deductQty),
                })) || target.colors;
                updatedProducts[compIdx] = { ...target, stock: newStock, colors: updatedColors };
              }
            });
          } else {
            // Deduct stock from single product
            const prodIdx = updatedProducts.findIndex((item) => item.id === p.id);
            if (prodIdx !== -1) {
              const target = updatedProducts[prodIdx];
              const newStock = Math.max(0, (target.stock || 0) - i.qty);
              const updatedColors = target.colors?.map((col) =>
                col.id === i.colorId ? { ...col, stock: Math.max(0, col.stock - i.qty) } : col
              ) || target.colors;
              updatedProducts[prodIdx] = { ...target, stock: newStock, colors: updatedColors };
            }
          }

          return {
            productId: p.id,
            name: p.name,
            image: p.images[0],
            price: p.price,
            qty: i.qty,
            colorId: i.colorId,
            colorName: color?.name || "Default",
            size: i.size,
            isCombo,
            comboComponents: comboComponentsSnapshot,
          };
        });

        // Save updated inventory back to store
        set({ products: updatedProducts });

        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const discount = get().couponDiscount;
        const total = Math.max(0, subtotal - discount + shipping + tax);
        const placedAt = new Date();
        const estDelivery = new Date(placedAt.getTime() + 1000 * 60 * 60 * 24 * 6);
        const order: Order = {
          id: uid("ord"),
          number: orderNumber(),
          items,
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponCode: get().couponCode || undefined,
          address,
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
          status: "placed",
          trackingNumber: `TRK${Math.floor(Math.random() * 10000000)}`,
          courier: "Shraddhanand Express",
          placedAt: placedAt.toISOString(),
          estimatedDelivery: estDelivery.toISOString(),
          timeline: buildTimeline("placed"),
        };
        set({ orders: [order, ...get().orders] });
        get().clearCart();
        get().pushNotification({
          type: "order",
          title: "Order confirmed",
          body: `Your order ${order.number} has been placed.`,
        });
        return order;
      },
      cancelOrder: (orderId) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? { ...o, status: "cancelled", paymentStatus: o.paymentStatus === "paid" ? "refunded" : "failed" }
              : o
          ),
        });
        get().pushToast({ title: "Order cancelled", description: "Any refund will be initiated shortly." });
        get().pushNotification({ type: "order", title: "Order cancelled", body: `Order cancelled.` });
      },
      advanceOrder: (orderId) => {
        set({
          orders: get().orders.map((o) => {
            if (o.id !== orderId) return o;
            const idx = orderStatusFlow.indexOf(o.status);
            const next = orderStatusFlow[Math.min(idx + 1, orderStatusFlow.length - 1)];
            return { ...o, status: next, timeline: buildTimeline(next) };
          }),
        });
      },
      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  timeline: buildTimeline(status),
                  paymentStatus:
                    status === "cancelled"
                      ? o.paymentStatus === "paid"
                        ? "refunded"
                        : "failed"
                      : o.paymentStatus,
                }
              : o
          ),
        });
        get().pushToast({
          title: "Order status updated",
          description: `Order marked as ${status.replace(/_/g, " ")}.`,
          variant: "success",
        });
      },
      requestReturn: (orderId, reason) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, status: "returned" } : o
          ),
        });
        get().pushToast({ title: "Return requested", description: reason, variant: "success" });
        get().pushNotification({ type: "order", title: "Return requested", body: "We'll review your request." });
      },

      notifications: [
        {
          id: uid("ntf"),
          type: "promo",
          title: "Festive Edit is live",
          body: "Up to 30% off on the Noir collection.",
          date: new Date().toISOString(),
          read: false,
        },
        {
          id: uid("ntf"),
          type: "system",
          title: "Welcome to Shraddhanand",
          body: "Use code WELCOME10 for 10% off your first order.",
          date: new Date().toISOString(),
          read: false,
        },
      ],
      markNotificationRead: (id) =>
        set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }),
      markAllNotificationsRead: () =>
        set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),
      deleteNotification: (id) =>
        set({ notifications: get().notifications.filter((n) => n.id !== id) }),
      pushNotification: (n) =>
        set({
          notifications: [
            { ...n, id: uid("ntf"), date: new Date().toISOString(), read: false },
            ...get().notifications,
          ],
        }),

      tickets: [],
      createTicket: (t) => {
        const ticket: SupportTicket = {
          ...t,
          id: uid("tkt"),
          createdAt: new Date().toISOString(),
          status: "open",
        };
        set({ tickets: [ticket, ...get().tickets] });
        get().pushToast({ title: "Support ticket created", description: "We'll reach out within 24h.", variant: "success" });
      },

      recentlyViewed: [],
      addRecentlyViewed: (productId) => {
        const rv = [productId, ...get().recentlyViewed.filter((id) => id !== productId)].slice(0, 8);
        set({ recentlyViewed: rv });
      },

      // products management
      products: allProducts,
      addProduct: (p) => {
        const id = p.id || uid("p");
        const newProduct: Product = { ...p, id };
        set({ products: [newProduct, ...(get().products || allProducts)] });
        get().pushToast({
          title: "Product added",
          description: `${newProduct.name} is now available in the store.`,
          variant: "success",
        });
      },
      updateProduct: (id, patch) => {
        set({
          products: (get().products || allProducts).map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        });
        get().pushToast({
          title: "Product updated",
          description: "Changes have been saved successfully.",
          variant: "success",
        });
      },
      deleteProduct: (id) => {
        const current = get().products || allProducts;
        const found = current.find((p) => p.id === id);
        set({
          products: current.filter((p) => p.id !== id),
        });
        get().pushToast({
          title: "Product deleted",
          description: found ? `${found.name} removed from store.` : "Product removed.",
        });
      },

      // coupons management
      coupons: defaultCoupons,
      addCoupon: (c) => {
        const current = get().coupons || defaultCoupons;
        const exists = current.some((x) => x.code.toUpperCase() === c.code.toUpperCase());
        if (exists) {
          get().pushToast({
            title: "Coupon exists",
            description: `Code ${c.code} already exists.`,
            variant: "destructive",
          });
          return;
        }
        set({ coupons: [c, ...current] });
        get().pushToast({
          title: "Coupon created",
          description: `Code ${c.code} is now active.`,
          variant: "success",
        });
      },
      deleteCoupon: (code) => {
        const current = get().coupons || defaultCoupons;
        set({ coupons: current.filter((c) => c.code.toUpperCase() !== code.toUpperCase()) });
        get().pushToast({
          title: "Coupon deleted",
          description: `Coupon ${code} has been removed.`,
        });
      },

      // reviews management
      reviews: initialReviews,
      approveReview: (reviewId) => {
        const current = get().reviews || initialReviews;
        set({
          reviews: current.map((r) =>
            r.id === reviewId ? { ...r, status: "approved", verified: true } : r
          ),
        });
        get().pushToast({
          title: "Review approved",
          description: "The review has been verified and published.",
          variant: "success",
        });
      },
      rejectReview: (reviewId) => {
        const current = get().reviews || initialReviews;
        set({
          reviews: current.map((r) =>
            r.id === reviewId ? { ...r, status: "rejected", verified: false } : r
          ),
        });
        get().pushToast({
          title: "Review rejected",
          description: "The review has been marked as rejected.",
        });
      },
      replyReview: (reviewId, reply) => {
        const current = get().reviews || initialReviews;
        const now = new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        set({
          reviews: current.map((r) =>
            r.id === reviewId ? { ...r, adminReply: reply, adminReplyDate: now } : r
          ),
        });
        get().pushToast({
          title: "Reply posted",
          description: "Your official response has been saved.",
          variant: "success",
        });
      },

      // store settings
      storeSettings: {
        storeName: "Shraddhanand (श्रद्धानंद) Jewellery",
        supportEmail: "care@shraddhanand.com",
        supportPhone: "1800-200-SHRD",
        currency: "INR (₹)",
        freeShippingThreshold: 999,
        taxRate: 3,
        address: "Peninsula Business Park, Lower Parel, Mumbai, MH - 400013",
      },
      updateStoreSettings: (patch) => {
        set({ storeSettings: { ...get().storeSettings, ...patch } });
        get().pushToast({
          title: "Settings saved",
          description: "Store settings updated successfully.",
          variant: "success",
        });
      },

      // admin users
      adminUsers: [
        { id: "u1", name: "Shraddhanand Admin", email: "admin@shraddhanand.com", role: "Super Admin", perms: "All access" },
        { id: "u2", name: "Pooja Mehta", email: "pooja.m@shraddhanand.com", role: "Store Manager", perms: "Catalog, Orders, Customers" },
        { id: "u3", name: "Rahul Verma", email: "rahul.v@shraddhanand.com", role: "Support Agent", perms: "Orders, Support, Reviews" },
        { id: "u4", name: "Ananya Iyer", email: "ananya.i@shraddhanand.com", role: "Analytics Viewer", perms: "Reports only" },
      ],
      addAdminUser: (u) => {
        const newUser = { ...u, id: uid("adm") };
        set({ adminUsers: [...(get().adminUsers || []), newUser] });
        get().pushToast({
          title: "Team member added",
          description: `${newUser.name} assigned as ${newUser.role}.`,
          variant: "success",
        });
      },
      deleteAdminUser: (id) => {
        const current = get().adminUsers || [];
        const found = current.find((u) => u.id === id);
        set({ adminUsers: current.filter((u) => u.id !== id) });
        get().pushToast({
          title: "User removed",
          description: found ? `${found.name} removed from admin access.` : undefined,
        });
      },

      toasts: [],
      pushToast: (t) => {
        const id = uid("tst");
        set({ toasts: [...get().toasts, { ...t, id }] });
        setTimeout(() => {
          set({ toasts: get().toasts.filter((x) => x.id !== id) });
        }, 3500);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    }),
    {
      name: "shraddhanand-store",
      partialize: (s) => ({
        cart: s.cart,
        wishlist: s.wishlist,
        user: s.user,
        addresses: s.addresses,
        orders: s.orders,
        notifications: s.notifications,
        tickets: s.tickets,
        recentlyViewed: s.recentlyViewed,
        products: s.products,
        coupons: s.coupons,
        reviews: s.reviews,
        storeSettings: s.storeSettings,
        adminUsers: s.adminUsers,
      }),
    }
  )
);

// Keep data/products helper dynamically linked to useStore
if (typeof window !== "undefined") {
  setProductStoreGetter(() => useStore.getState().products || allProducts);
}

// Selectors / helpers
export function useCartCount() {
  return useStore((s) => s.cart.filter((i) => !i.savedForLater).reduce((n, i) => n + i.qty, 0));
}

export function useWishlistCount() {
  return useStore((s) => s.wishlist.length);
}

export function useUnreadNotifications() {
  return useStore((s) => s.notifications.filter((n) => !n.read).length);
}

export function formatINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function discountPct(price: number, mrp: number) {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export { allProducts };
