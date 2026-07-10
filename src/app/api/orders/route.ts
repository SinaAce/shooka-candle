import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber, paymentMethodFromCheckout } from "@/lib/utils";
import { getSiteSettings, calculateOrderTotals } from "@/lib/settings";
import { notifyAllAdmins, createNotification } from "@/lib/notifications";
import { parsePagination, paginationMeta } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { page, limit, skip } = parsePagination(request.nextUrl.searchParams);

    const where = { userId: session.user.id };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: paginationMeta(total, page, limit),
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت سفارشات" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { order: "asc" }, take: 1 } },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "سبد خرید خالی است" },
        { status: 400 }
      );
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `موجودی ${item.product.name} کافی نیست` },
          { status: 400 }
        );
      }
    }

    const address = await prisma.address.findFirst({
      where: { id: parsed.data.addressId, userId: session.user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "آدرس یافت نشد" }, { status: 400 });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const settings = await getSiteSettings();
    const paymentKey = parsed.data.paymentMethod;
    const paymentEnabled =
      (paymentKey === "cod" && settings.codEnabled) ||
      (paymentKey === "online" && settings.onlineEnabled) ||
      (paymentKey === "card" && settings.cardTransferEnabled);

    if (!paymentEnabled) {
      return NextResponse.json(
        { error: "روش پرداخت انتخاب‌شده غیرفعال است" },
        { status: 400 }
      );
    }

    const paymentMethod = paymentMethodFromCheckout(paymentKey);
    const isCardPayment = paymentMethod === "CARD";

    const { discountAmount, shippingCost, total } = calculateOrderTotals(
      subtotal,
      settings
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          addressId: address.id,
          subtotal,
          discountAmount,
          shippingCost,
          total,
          notes: parsed.data.notes,
          paymentMethod,
          receiptStatus: isCardPayment ? "AWAITING_RECEIPT" : null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.images[0]?.url,
            })),
          },
        },
        include: { items: true, address: true },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    await notifyAllAdmins({
      title: "سفارش جدید",
      message: isCardPayment
        ? `سفارش ${order.orderNumber} (کارت به کارت) ثبت شد — در انتظار رسید.`
        : `سفارش ${order.orderNumber} به مبلغ ${total.toLocaleString("fa-IR")} تومان ثبت شد.`,
      link: "/admin/orders",
      type: "order",
    });

    await createNotification({
      userId: session.user.id,
      type: "order",
      title: "سفارش شما ثبت شد",
      message: isCardPayment
        ? `سفارش ${order.orderNumber} ثبت شد. لطفاً رسید واریز را ارسال کنید.`
        : `سفارش ${order.orderNumber} با موفقیت ثبت شد.`,
      link: `/account/orders/${order.id}`,
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "خطا در ثبت سفارش" },
      { status: 500 }
    );
  }
}
