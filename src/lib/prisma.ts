import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getDatabasePath() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (url.startsWith("file:")) {
    const filePath = url.replace("file:", "");
    if (!path.isAbsolute(filePath)) {
      return `file:${path.join(process.cwd(), filePath)}`;
    }
  }
  return url;
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: getDatabasePath() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
