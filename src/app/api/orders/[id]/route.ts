import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

export async function GET(
  _request: NextRequest,
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
        OR: [{ id }, { orderNumber: id }],
        ...(session.user.role !== "ADMIN"
          ? { userId: session.user.id }
          : {}),
      },
      include: {
        items: true,
        address: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت سفارش" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, receiptAction } = body;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    if (receiptAction === "approve" || receiptAction === "reject") {
      if (existing.paymentMethod !== "CARD") {
        return NextResponse.json(
          { error: "این سفارش کارت به کارت نیست" },
          { status: 400 }
        );
      }

      if (
        (!existing.receiptUrl && !existing.receiptText) ||
        existing.receiptStatus !== "PENDING_REVIEW"
      ) {
        return NextResponse.json(
          { error: "رسیدی برای بررسی وجود ندارد" },
          { status: 400 }
        );
      }

      if (receiptAction === "approve") {
        const order = await prisma.order.update({
          where: { id },
          data: {
            receiptStatus: "APPROVED",
            status: "CONFIRMED",
          },
          include: { items: true, address: true },
        });

        await createNotification({
          userId: order.userId,
          type: "order",
          title: "پرداخت تأیید شد",
          message: `رسید سفارش ${order.orderNumber} تأیید شد و سفارش شما فعال گردید.`,
          link: `/account/orders/${order.id}`,
        });

        return NextResponse.json(order);
      }

      const order = await prisma.$transaction(async (tx) => {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        return tx.order.update({
          where: { id },
          data: {
            receiptStatus: "REJECTED",
            status: "CANCELLED",
          },
          include: { items: true, address: true },
        });
      });

      await createNotification({
        userId: order.userId,
        type: "order",
        title: "پرداخت رد شد",
        message: `رسید سفارش ${order.orderNumber} رد شد و سفارش لغو گردید.`,
        link: `/account/orders/${order.id}`,
      });

      return NextResponse.json(order);
    }

    if (!status) {
      return NextResponse.json(
        { error: "وضعیت یا عملیات رسید الزامی است" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, address: true },
    });

    const statusMessage =
      status === "CANCELLED"
        ? "سفارش شما لغو شد."
        : status === "CONFIRMED"
          ? "سفارش شما تأیید شد."
          : status === "SHIPPED"
            ? "سفارش شما ارسال شد."
            : status === "DELIVERED"
              ? "سفارش شما تحویل داده شد."
              : `وضعیت سفارش: ${ORDER_STATUS_LABELS[status] || status}`;

    await createNotification({
      userId: order.userId,
      type: "order",
      title: "به‌روزرسانی سفارش",
      message: `سفارش ${order.orderNumber}: ${statusMessage}`,
      link: `/account/orders/${order.id}`,
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "خطا در بروزرسانی سفارش" },
      { status: 500 }
    );
  }
}
