export const SHOP_CURRENCY = "GBP";
export const CURRENCY_SYMBOL = "£";

export type ShippingOptionId = "standard" | "express" | "overnight";

const createCurrencyFormatter = (options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: SHOP_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  });

export const formatGBP = (value: number, options: Intl.NumberFormatOptions = {}) =>
  createCurrencyFormatter(options).format(value);

export const formatGBPTwoDecimals = (value: number) =>
  formatGBP(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const parseGBPValue = (value: string) =>
  Number(value.replace(/[^\d.]/g, "")) || 0;

export const SHOPPER_PRICE_RANGES = [
  "Under £50",
  "£50-£75",
  "£75-£100",
  "£100+",
] as const;

export const SHIPPING_OPTIONS: Record<
  ShippingOptionId,
  {
    label: string;
    price: number;
    deliveryWindow: string;
  }
> = {
  standard: {
    label: "Standard Shipping",
    price: 0,
    deliveryWindow: "3-5 business days",
  },
  express: {
    label: "Express Shipping",
    price: 15,
    deliveryWindow: "1-2 business days",
  },
  overnight: {
    label: "Overnight Delivery",
    price: 35,
    deliveryWindow: "Next business day",
  },
};

export const SHIPPING_OPTION_ORDER: ShippingOptionId[] = [
  "standard",
  "express",
  "overnight",
];

export const formatShippingPrice = (shippingOptionId: ShippingOptionId) => {
  const { price } = SHIPPING_OPTIONS[shippingOptionId];
  return price === 0 ? "Free" : formatGBP(price);
};

export const formatShippingOptionSummary = (shippingOptionId: ShippingOptionId) => {
  const option = SHIPPING_OPTIONS[shippingOptionId];
  return `${formatShippingPrice(shippingOptionId)} • ${option.deliveryWindow}`;
};

export const SHOPPER_USPS = [
  `Free UK standard shipping`,
  "365 day warranty",
  "+100,000 happy customers",
] as const;
