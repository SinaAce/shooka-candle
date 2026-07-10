import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { GalleryType } from "@/generated/prisma/client";

function parseGalleryType(value: string | null): GalleryType | undefined {
  if (value === "hero") return "HERO";
  if (value === "page") return "PAGE";
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const type = parseGalleryType(request.nextUrl.searchParams.get("type"));

    const images = await prisma.galleryImage.findMany({
      where: {
        active: true,
        ...(type ? { type } : {}),
      },
      orderBy: { order: "asc" },
      select: { id: true, url: true, alt: true, type: true },
    });

    return NextResponse.json(images);
  } catch {
    return NextResponse.json(
      { error: "خطا در دریافت گالری" },
      { status: 500 }
    );
  }
}
