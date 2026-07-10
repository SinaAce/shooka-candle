import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.password) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      });

      const baseUrl =
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const resetUrl = `${baseUrl.replace(/\/$/, "")}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      try {
        await sendPasswordResetEmail(email, resetUrl);
      } catch (err) {
        console.error("Password reset email error:", err);
        if (process.env.NODE_ENV !== "development") {
          return NextResponse.json(
            { error: "ارسال ایمیل ممکن نشد. SMTP را بررسی کنید." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      message:
        "اگر ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال می‌شود.",
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در پردازش درخواست" },
      { status: 500 }
    );
  }
}
