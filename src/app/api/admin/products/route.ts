import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { generateProductSlug } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let slug = generateProductSlug(data.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = generateProductSlug(data.name, Date.now().toString(36));
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "خطا در ایجاد محصول" },
      { status: 500 }
    );
  }
}
