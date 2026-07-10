import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { uploadReceiptImage } from "@/lib/upload";
import { notifyAllAdmins, createNotification } from "@/lib/notifications";

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_TEXT_LENGTH = 1000;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
  "application/octet-stream",
]);

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function isCardOrder(order: {
  paymentMethod: string;
  notes: string | null;
  receiptStatus: string | null;
}) {
  return (
    order.paymentMethod === "CARD" ||
    order.receiptStatus != null ||
    order.notes?.includes("کارت به کارت") === true
  );
}

function resolveImageType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.has(file.type) && file.type !== "application/octet-stream") {
    return file.type;
  }

  const lowerName = file.name.toLowerCase();
  for (const [ext, mime] of Object.entries(EXT_TO_MIME)) {
    if (lowerName.endsWith(ext)) return mime;
  }

  return null;
}

function hasValidFile(file: FormDataEntryValue | null): file is File {
  return file instanceof File && file.size > 0;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    if (!isCardOrder(order)) {
      return NextResponse.json(
        { error: "این سفارش با روش کارت به کارت ثبت نشده است" },
        { status: 400 }
      );
    }

    if (order.receiptStatus === "APPROVED") {
      return NextResponse.json(
        { error: "رسید این سفارش قبلاً تأیید شده است" },
        { status: 400 }
      );
    }

    if (order.receiptStatus === "REJECTED") {
      return NextResponse.json(
        { error: "رسید این سفارش رد شده است" },
        { status: 400 }
      );
    }

    if (order.receiptStatus === "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "رسید قبلاً ارسال شده و در حال بررسی است" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const receiptTextRaw = formData.get("receiptText");
    const receiptText =
      typeof receiptTextRaw === "string" ? receiptTextRaw.trim() : "";

    const file = hasValidFile(fileEntry) ? fileEntry : null;

    if (!file && !receiptText) {
      return NextResponse.json(
        { error: "تصویر یا متن رسید الزامی است" },
        { status: 400 }
      );
    }

    if (receiptText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `متن رسید نباید بیشتر از ${MAX_TEXT_LENGTH} کاراکتر باشد` },
        { status: 400 }
      );
    }

    let receiptUrl: string | undefined;

    if (file) {
      const contentType = resolveImageType(file);
      if (!contentType) {
        return NextResponse.json(
          { error: "فرمت تصویر مجاز نیست. از JPG، PNG یا WebP استفاده کنید" },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      receiptUrl = await uploadReceiptImage(buffer, file.name, contentType);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "CARD",
        ...(receiptUrl ? { receiptUrl } : {}),
        ...(receiptText ? { receiptText } : {}),
        receiptStatus: "PENDING_REVIEW",
      },
    });

    const receiptType =
      receiptUrl && receiptText ? "تصویر و متن" : receiptUrl ? "تصویر" : "متن";

    try {
      await notifyAllAdmins({
        title: "رسید پرداخت جدید",
        message: `رسید (${receiptType}) سفارش ${order.orderNumber} برای بررسی ارسال شد.`,
        link: "/admin/orders",
        type: "order",
      });

      await createNotification({
        userId: session.user.id,
        type: "order",
        title: "رسید ارسال شد",
        message: `رسید سفارش ${order.orderNumber} دریافت شد و در حال بررسی است.`,
        link: `/account/orders/${order.id}`,
      });
    } catch {
      /* رسید ذخیره شد */
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Receipt upload error:", err);

    const message =
      err instanceof Error &&
      err.constructor.name === "PrismaClientValidationError"
        ? "خطای پایگاه داده. لطفاً سرور را یک‌بار ری‌استارت کنید (Ctrl+C و npm run dev)."
        : err instanceof Error
          ? err.message.includes("Unknown argument")
            ? "خطای همگام‌سازی پایگاه داده. سرور را ری‌استارت کنید."
            : `خطا در ارسال رسید: ${err.message}`
          : "خطا در ارسال رسید. لطفاً دوباره تلاش کنید";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
