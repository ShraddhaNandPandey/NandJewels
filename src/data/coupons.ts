import type { Coupon } from "@/lib/types";

export const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minOrder: 0,
    maxDiscount: 500,
    description: "10% off your first order, up to ₹500",
    expiresOn: "2026-12-31",
  },
  {
    code: "FESTIVE20",
    type: "percent",
    value: 20,
    minOrder: 1500,
    maxDiscount: 1000,
    description: "20% off orders above ₹1500, up to ₹1000",
    expiresOn: "2026-12-31",
  },
  {
    code: "FLAT150",
    type: "flat",
    value: 150,
    minOrder: 999,
    description: "Flat ₹150 off orders above ₹999",
    expiresOn: "2026-12-31",
  },
  {
    code: "FIRSTORDER",
    type: "percent",
    value: 15,
    minOrder: 0,
    maxDiscount: 750,
    description: "15% off, exclusive for first-time buyers",
    expiresOn: "2026-12-31",
  },
  {
    code: "VRUNDORA200",
    type: "flat",
    value: 200,
    minOrder: 1000,
    description: "Flat ₹200 off signature collections",
    expiresOn: "2026-12-31",
  },
];

export function validateCoupon(
  code: string,
  subtotal: number
): { ok: true; coupon: Coupon } | { ok: false; message: string } {
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  if (!coupon) return { ok: false, message: "Invalid coupon code." };
  const today = new Date();
  if (new Date(coupon.expiresOn) < today)
    return { ok: false, message: "This coupon has expired." };
  if (subtotal < coupon.minOrder)
    return {
      ok: false,
      message: `Add items worth ₹${coupon.minOrder - subtotal} more to use this coupon.`,
    };
  return { ok: true, coupon };
}

export function applyCouponDiscount(coupon: Coupon, subtotal: number) {
  if (coupon.type === "flat") return Math.min(coupon.value, subtotal);
  const raw = (subtotal * coupon.value) / 100;
  return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
}
