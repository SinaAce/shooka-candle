import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { siteSettingsSchema } from "@/lib/validations";
import { notifyAllAdmins, notifyAllUsers, createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = siteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const cardNumber = parsed.data.cardNumber.replace(/\D/g, "");

    const previous = await getSiteSettings();

    const settings = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        ...parsed.data,
        cardNumber,
      },
      create: {
        id: "default",
        ...parsed.data,
        cardNumber,
      },
    });

    await notifyAllAdmins({
      title: "تنظیمات سایت بروزرسانی شد",
      message: `${session.user.name || "مدیر"} تنظیمات پرداخت/تخفیف را تغییر داد.`,
      link: "/admin/settings",
      type: "system",
      excludeUserId: session.user.id,
    });

    await createNotificationForAdmin(session.user.id, settings);

    if (
      settings.promoBannerActive &&
      (!previous.promoBannerActive ||
        previous.promoBannerText !== settings.promoBannerText)
    ) {
      await notifyAllUsers({
        title: "پیشنهاد ویژه شوکا",
        message:
          settings.promoBannerText?.trim() ||
          `تخفیف ${settings.globalDiscountPercent}% — فرصت را از دست ندهید!`,
        link: settings.promoBannerLink || "/products",
        type: "announcement",
      });
    }

    if (
      settings.globalDiscountActive &&
      settings.globalDiscountPercent > 0 &&
      (!previous.globalDiscountActive ||
        previous.globalDiscountPercent !== settings.globalDiscountPercent)
    ) {
      await notifyAllUsers({
        title: "تخفیف ویژه شوکا",
        message: `تا ${settings.globalDiscountPercent}% تخفیف روی تمام محصولات فعال شد!`,
        link: "/products",
        type: "announcement",
      });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "خطا در ذخیره تنظیمات" },
      { status: 500 }
    );
  }
}

async function createNotificationForAdmin(
  userId: string,
  settings: { globalDiscountActive: boolean; globalDiscountPercent: number }
) {
  const { createNotification } = await import("@/lib/notifications");
  await createNotification({
    userId,
    type: "system",
    title: "تنظیمات ذخیره شد",
    message: settings.globalDiscountActive
      ? `تخفیف سراسری ${settings.globalDiscountPercent}% فعال شد.`
      : "تغییرات تنظیمات با موفقیت ذخیره شد.",
    link: "/admin/settings",
  });
}
