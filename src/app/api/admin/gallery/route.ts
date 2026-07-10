import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadGalleryImage } from "@/lib/upload";
import type { GalleryType } from "@/generated/prisma/client";

function parseGalleryType(value: string | null): GalleryType | undefined {
  if (value === "hero") return "HERO";
  if (value === "page") return "PAGE";
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const type = parseGalleryType(request.nextUrl.searchParams.get("type"));

    const images = await prisma.galleryImage.findMany({
      where: type ? { type } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(images);
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت گالری" },
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

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const alt = (formData.get("alt") as string) || undefined;
      const type = parseGalleryType(formData.get("type") as string) ?? "HERO";

      if (!file) {
        return NextResponse.json({ error: "فایل الزامی است" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadGalleryImage(buffer, file.name, file.type);
      const count = await prisma.galleryImage.count({ where: { type } });

      const image = await prisma.galleryImage.create({
        data: { url, alt: alt || file.name, order: count, type },
      });

      return NextResponse.json(image, { status: 201 });
    }

    const body = await request.json();
    const { url, alt, order, active, type: rawType } = body as {
      url?: string;
      alt?: string;
      order?: number;
      active?: boolean;
      type?: string;
    };

    if (!url) {
      return NextResponse.json({ error: "آدرس تصویر الزامی است" }, { status: 400 });
    }

    const type = parseGalleryType(rawType ?? null) ?? "HERO";
    const count = await prisma.galleryImage.count({ where: { type } });

    const image = await prisma.galleryImage.create({
      data: {
        url,
        alt,
        order: order ?? count,
        active: active ?? true,
        type,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "خطا در افزودن تصویر" },
      { status: 500 }
    );
  }
}
