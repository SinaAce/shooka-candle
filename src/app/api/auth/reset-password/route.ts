import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, token, password } = parsed.data;

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token },
    });

    if (!record || record.expires < new Date()) {
      return NextResponse.json(
        { error: "لینک نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashed },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: { identifier: email, token },
        },
      }),
    ]);

    return NextResponse.json({ message: "رمز عبور با موفقیت تغییر کرد" });
  } catch {
    return NextResponse.json(
      { error: "خطا در تغییر رمز عبور" },
      { status: 500 }
    );
  }
}
