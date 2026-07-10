import prisma from "./prisma";

interface CreateNotificationInput {
  userId: string;
  type?: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type ?? "info",
      title: input.title,
      message: input.message,
      link: input.link,
    },
  });
}

export async function notifyAllUsers(input: {
  title: string;
  message: string;
  link?: string;
  type?: string;
}) {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true },
  });

  if (users.length === 0) return 0;

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      type: input.type ?? "announcement",
      title: input.title,
      message: input.message,
      link: input.link,
    })),
  });

  return users.length;
}

export async function notifyAllAdmins(input: {
  title: string;
  message: string;
  link?: string;
  type?: string;
  excludeUserId?: string;
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      ...(input.excludeUserId ? { NOT: { id: input.excludeUserId } } : {}),
    },
    select: { id: true },
  });

  if (admins.length === 0) return 0;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: input.type ?? "system",
      title: input.title,
      message: input.message,
      link: input.link,
    })),
  });

  return admins.length;
}
