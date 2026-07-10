import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
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

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
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
  }

  return cart;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const cart = await getOrCreateCart(session.user.id);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت سبد خرید" },
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

    const { productId, quantity = 1 } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { error: "محصول مشخص نشده" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, active: true },
    });

    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "موجودی کافی نیست" },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(session.user.id);

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stock < newQty) {
        return NextResponse.json(
          { error: "موجودی کافی نیست" },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await getOrCreateCart(session.user.id);
    return NextResponse.json(updatedCart);
  } catch {
    return NextResponse.json(
      { error: "خطا در افزودن به سبد خرید" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { itemId, quantity } = await request.json();

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { product: true },
      });

      if (!item || item.product.stock < quantity) {
        return NextResponse.json(
          { error: "موجودی کافی نیست" },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    const cart = await getOrCreateCart(session.user.id);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json(
      { error: "خطا در بروزرسانی سبد خرید" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const { itemId } = await request.json();
    await prisma.cartItem.delete({ where: { id: itemId } });

    const cart = await getOrCreateCart(session.user.id);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json(
      { error: "خطا در حذف از سبد خرید" },
      { status: 500 }
    );
  }
}
