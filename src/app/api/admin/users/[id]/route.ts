import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { role, banned } = body as { role?: "USER" | "ADMIN"; banned?: boolean };

    if (id === session.user.id && role === "USER") {
      return NextResponse.json(
        { error: "نمی‌توانید نقش خود را پایین بیاورید" },
        { status: 400 }
      );
    }

    if (id === session.user.id && banned === true) {
      return NextResponse.json(
        { error: "نمی‌توانید خود را مسدود کنید" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(banned !== undefined && { banned }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی کاربر" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "نمی‌توانید حساب خود را حذف کنید" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "خطا در حذف کاربر" },
      { status: 500 }
    );
  }
}
