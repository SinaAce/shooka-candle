import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { announcementSchema } from "@/lib/validations";
import { notifyAllUsers, createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const count = await notifyAllUsers({
      title: parsed.data.title,
      message: parsed.data.message,
      link: parsed.data.link || "/account/notifications",
      type: "announcement",
    });

    await createNotification({
      userId: session.user.id,
      type: "system",
      title: "اطلاعیه ارسال شد",
      message: `اطلاعیه «${parsed.data.title}» برای ${count} کاربر ارسال شد.`,
      link: "/admin/announcements",
    });

    return NextResponse.json({ count }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "خطا در ارسال اطلاعیه" },
      { status: 500 }
    );
  }
}
