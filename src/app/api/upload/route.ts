import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadProductImage } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("productId") as string;

    if (!file) {
      return NextResponse.json({ error: "فایل الزامی است" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage(buffer, file.name, file.type);

    if (productId) {
      const imageCount = await prisma.productImage.count({
        where: { productId },
      });

      const image = await prisma.productImage.create({
        data: {
          url,
          alt: file.name,
          order: imageCount,
          productId,
        },
      });

      return NextResponse.json(image);
    }

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "خطا در آپلود تصویر" },
      { status: 500 }
    );
  }
}
