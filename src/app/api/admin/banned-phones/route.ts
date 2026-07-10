import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizePhone } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const phones = await prisma.bannedPhone.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(phones);
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت لیست" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const { phone, reason, banUser } = body as {
      phone?: string;
      reason?: string;
      banUser?: boolean;
    };

    if (!phone?.trim()) {
      return NextResponse.json({ error: "شماره الزامی است" }, { status: 400 });
    }

    let normalized: string;
    try {
      normalized = normalizePhone(phone);
    } catch {
      return NextResponse.json({ error: "شماره موبایل نامعتبر است" }, { status: 400 });
    }

    const banned = await prisma.bannedPhone.upsert({
      where: { phone: normalized },
      update: { reason: reason || undefined },
      create: { phone: normalized, reason },
    });

    if (banUser) {
      await prisma.user.updateMany({
        where: { phone: normalized },
        data: { banned: true },
      });
    }

    return NextResponse.json(banned, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "خطا در مسدودسازی شماره" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const phone = request.nextUrl.searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ error: "شماره الزامی است" }, { status: 400 });
    }

    await prisma.bannedPhone.deleteMany({
      where: { phone },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "خطا در رفع مسدودیت" },
      { status: 500 }
    );
  }
}
