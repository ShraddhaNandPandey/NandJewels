# Shraddhanand (श्रद्धानंद) — Fashion & Demi-Fine Jewellery E-Commerce

A complete, production-quality, responsive **single-vendor fashion/artificial jewellery e-commerce** website built with **Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, and Recharts**.

> Shraddhanand (श्रद्धानंद) sells demi-fine fashion / artificial / imitation jewellery — **not** gold jewellery. The design is premium, elegant, image-focused and conversion-oriented.

---

## ✨ Features

### Customer storefront
- **Premium homepage** — hero, trust strip, shop-by-category, new arrivals, promo banner, bestsellers, featured collections, testimonials, Instagram strip, newsletter
- **Shop / catalogue** — category, subcategory, collection, price, colour, rating, availability & tag filters; 6 sort modes; active-filter chips; mobile filter drawer; empty state
- **Search** — real-time search across name, SKU, category, tags, material & collection; recent + popular searches; category shortcuts; live product results
- **Product detail** — image gallery with thumbnails + prev/next, colour & size variants, quantity, Add to Cart / Buy Now / wishlist / share, PIN-code delivery check, tabs (description, specs, reviews), rating distribution, helpful reviews, related products, recently viewed
- **Wishlist** — add/remove/move-to-cart, persistence, empty state
- **Cart** — quantity controls, save-for-later, free-shipping progress, coupon system (4 working coupons), order summary, persistence
- **Multi-step checkout** — Contact → Address → Delivery → Payment → Review, with sticky order summary, simulated card/UPI/wallet/COD, processing state
- **Order success** — confirmation, estimated delivery, order summary, invoice download, next-steps
- **My orders** — status filters, order cards, track-by-order-number
- **Order details** — full shipment tracking timeline, items, address, payment breakdown, cancel/return flows with modals
- **Account** — profile dashboard, edit profile, quick stats, menu grid, recent orders
- **Addresses** — add/edit/delete/set-default, Indian PIN-code validation, labelled (Home/Work/Other)
- **Notifications** — read/unread, mark-all-read, delete, badge
- **Support** — create tickets, FAQs, contact options, ticket history
- **Auth** — login & register with validation, show/hide password, guest login, social buttons

### Admin panel
- **Sidebar layout** grouped by Overview / Catalog / Sales / Marketing / Insights / System
- **Dashboard** — KPI cards (revenue, orders, AOV, products), sales area chart, category pie chart, recent orders, stock alerts
- **Products** — searchable/filterable table with stock status, price, rating, actions
- **Orders** — status KPIs + full orders table
- **Customers** — lifetime value, tiers (Bronze/Silver/Gold), customer table
- **Coupons** — visual coupon cards with full metadata
- **Reviews** — moderation queue with approve/reject
- **Reports** — orders bar chart, revenue trend, conversion metrics
- **Settings** — store settings + roles & permissions

### Design system
- Premium palette: **ivory background, deep charcoal text, champagne/muted-gold accents**
- Serif headings (Playfair Display) + sans body (Inter)
- Custom scrollbar, marquee announcement bar, shimmer skeletons, fade-up animations
- Fully responsive, mobile-first with bottom nav + floating cart
- Sticky footer that pins to viewport bottom and pushes down on overflow

---

## 🛠 Tech stack

| Layer | Technology |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui (New York) + Lucide icons |
| State | Zustand (with `persist` middleware → localStorage) |
| Charts | Recharts |
| Fonts | Playfair Display + Inter (next/font) |

All data is mock/local — cart, wishlist, orders, addresses, notifications, tickets and auth all persist to `localStorage` via Zustand, so the app is fully functional without a backend. The store layer is cleanly isolated so a real REST API can be dropped in later.

---

## 🚀 Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:3000)
npm run dev

# production build
npm run build

# start production server
npm run start

# lint
npm run lint
```

---

## 📁 Project structure

```
src/
├── app/
│   ├── layout.tsx          # root layout, fonts, toasters
│   ├── page.tsx            # view router (single route SPA)
│   └── globals.css         # premium jewellery theme
├── components/
│   ├── layout/             # Header, Footer, MobileNav, SearchModal, ToastHost
│   ├── product/            # ProductCard (+ skeleton)
│   ├── Breadcrumbs.tsx
│   └── ui/                 # shadcn/ui components
├── data/
│   ├── categories.ts       # 8 hierarchical categories
│   ├── products.ts         # 24 products + collections + search
│   └── coupons.ts          # 4 coupons + validation
├── lib/
│   ├── types.ts            # full domain type system
│   └── utils.ts
├── store/
│   └── useStore.ts         # Zustand store (cart, wishlist, orders, auth, ...)
└── views/
    ├── HomeView.tsx
    ├── ShopView.tsx
    ├── ProductView.tsx
    ├── CartView.tsx
    ├── WishlistView.tsx
    ├── CheckoutView.tsx
    ├── OrderSuccessView.tsx
    ├── OrdersView.tsx
    ├── OrderDetailsView.tsx
    ├── AccountView.tsx
    ├── AddressesView.tsx
    ├── NotificationsView.tsx
    ├── SupportView.tsx
    ├── AuthView.tsx
    └── AdminView.tsx
```

---

## 🎫 Demo coupons

| Code | Offer |
|------|-------|
| `WELCOME10` | 10% off, up to ₹500 |
| `FESTIVE20` | 20% off above ₹1500, up to ₹1000 |
| `FLAT150` | Flat ₹150 off above ₹999 |
| `FIRSTORDER` | 15% off, up to ₹750 |

---

## 📝 Notes

- The app is a single-route SPA (`/`) using client-side view state, per the project's routing constraints.
- All "backend" behaviour is realistically simulated on the frontend with mock services and localStorage persistence.
- Images use royalty-free Unsplash photography.
- The admin panel is reachable via the **ADMIN** link in the header.


## Demo developer contact

Developer contact shown in the client demo: **Shraddha Nand Pandey** ♥ (blue heart in the UI).
