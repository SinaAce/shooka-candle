import prisma from "./prisma";

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;

export async function getSiteSettings() {
  let settings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.siteSetting.create({
      data: { id: "default" },
    });
  }

  return settings;
}

export function calculateOrderTotals(
  subtotal: number,
  settings: {
    globalDiscountActive: boolean;
    globalDiscountPercent: number;
    freeShippingMin: number;
    shippingCost: number;
  }
) {
  let discountAmount = 0;
  if (settings.globalDiscountActive && settings.globalDiscountPercent > 0) {
    discountAmount = Math.round(
      (subtotal * settings.globalDiscountPercent) / 100
    );
  }

  const afterDiscount = subtotal - discountAmount;
  const shippingCost =
    afterDiscount >= settings.freeShippingMin ? 0 : settings.shippingCost;
  const total = afterDiscount + shippingCost;

  return { subtotal, discountAmount, shippingCost, total };
}

export function formatCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
}
