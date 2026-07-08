// Single source of truth for cart / checkout money math.
// Previously this logic was duplicated (and subtly diverging) between
// CartDrawer and CheckoutPage.

export const FREE_DELIVERY_THRESHOLD = 999;
export const STANDARD_DELIVERY_COST = 99;
export const EXPRESS_DELIVERY_COST = 149;
export const AUTO_DISCOUNT_THRESHOLD = 5000;
export const AUTO_DISCOUNT_RATE = 0.1; // 10% off orders above the threshold
export const TAX_RATE = 0.05; // 5%

export type DeliveryOption = 'standard' | 'express';

export interface PriceOptions {
  /** Coupon percentage (e.g. 10 for 10% off). */
  couponPercent?: number;
  deliveryOption?: DeliveryOption;
}

export interface PriceBreakdown {
  subtotal: number;
  baseDiscount: number;
  couponDiscount: number;
  discount: number;
  standardDeliveryCost: number;
  delivery: number;
  tax: number;
  total: number;
}

/**
 * Compute the full price breakdown for a given subtotal.
 * Tax is charged on the subtotal (pre-discount) to match existing invoices.
 * The grand total is clamped at >= 0 so stacked discounts can never go negative.
 */
export function computeTotals(subtotal: number, opts: PriceOptions = {}): PriceBreakdown {
  const { couponPercent = 0, deliveryOption = 'standard' } = opts;

  const baseDiscount =
    subtotal > AUTO_DISCOUNT_THRESHOLD ? Math.round(subtotal * AUTO_DISCOUNT_RATE) : 0;
  const couponDiscount = couponPercent > 0 ? Math.round((subtotal * couponPercent) / 100) : 0;
  const discount = baseDiscount + couponDiscount;

  const standardDeliveryCost = subtotal > FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_COST;
  const delivery = deliveryOption === 'express' ? EXPRESS_DELIVERY_COST : standardDeliveryCost;

  const tax = Math.round(subtotal * TAX_RATE);

  const total = Math.max(0, subtotal - discount) + delivery + tax;

  return { subtotal, baseDiscount, couponDiscount, discount, standardDeliveryCost, delivery, tax, total };
}
