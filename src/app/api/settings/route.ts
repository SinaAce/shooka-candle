import { NextResponse } from "next/server";
import { getSiteSettings, formatCardNumber } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getSiteSettings();

    return NextResponse.json({
      cardNumber: formatCardNumber(settings.cardNumber),
      cardHolder: settings.cardHolder,
      bankName: settings.bankName,
      shebaNumber: settings.shebaNumber,
      codEnabled: settings.codEnabled,
      onlineEnabled: settings.onlineEnabled,
      cardTransferEnabled: settings.cardTransferEnabled,
      shippingCost: settings.shippingCost,
      freeShippingMin: settings.freeShippingMin,
      globalDiscountPercent: settings.globalDiscountPercent,
      globalDiscountActive: settings.globalDiscountActive,
      promoBannerActive: settings.promoBannerActive,
      promoBannerText: settings.promoBannerText,
      promoBannerLink: settings.promoBannerLink,
      promoBannerImageUrl: settings.promoBannerImageUrl,
      siteTagline: settings.siteTagline,
      contactPhone: settings.contactPhone,
      contactEmail: settings.contactEmail,
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات" },
      { status: 500 }
    );
  }
}
