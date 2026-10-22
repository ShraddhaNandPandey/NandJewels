"use client";

import { useStore } from "@/store/useStore";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchModal } from "@/components/layout/SearchModal";
import { ToastHost } from "@/components/layout/ToastHost";
import { HomeView } from "@/views/HomeView";
import { ShopView } from "@/views/ShopView";
import { ProductView } from "@/views/ProductView";
import { CartView } from "@/views/CartView";
import { WishlistView } from "@/views/WishlistView";
import { CheckoutView } from "@/views/CheckoutView";
import { OrderSuccessView } from "@/views/OrderSuccessView";
import { OrdersView } from "@/views/OrdersView";
import { OrderDetailsView } from "@/views/OrderDetailsView";
import { AccountView } from "@/views/AccountView";
import { AddressesView } from "@/views/AddressesView";
import { NotificationsView } from "@/views/NotificationsView";
import { SupportView } from "@/views/SupportView";
import { AuthView } from "@/views/AuthView";
import { AdminView } from "@/views/AdminView";

export default function Home() {
  const view = useStore((s) => s.view);

  const isAdmin = view === "admin";
  const isAuth = view === "login" || view === "register";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        {view === "home" && <HomeView />}
        {view === "shop" && <ShopView />}
        {view === "product" && <ProductView />}
        {view === "cart" && <CartView />}
        {view === "wishlist" && <WishlistView />}
        {view === "checkout" && <CheckoutView />}
        {view === "order-success" && <OrderSuccessView />}
        {view === "orders" && <OrdersView />}
        {view === "order-details" && <OrderDetailsView />}
        {view === "account" && <AccountView />}
        {view === "addresses" && <AddressesView />}
        {view === "notifications" && <NotificationsView />}
        {view === "support" && <SupportView />}
        {(view === "login" || view === "register") && <AuthView />}
        {view === "admin" && <AdminView />}
      </main>
      {!isAdmin && !isAuth && <Footer />}
      {!isAdmin && <MobileNav />}
      <SearchModal />
      <ToastHost />
    </div>
  );
}
