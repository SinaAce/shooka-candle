import prisma from "./prisma";
import { normalizePhone } from "./utils";

export async function isPhoneBanned(phone?: string | null) {
  if (!phone?.trim()) return false;
  let normalized = phone.trim();
  try {
    normalized = normalizePhone(phone);
  } catch {
    // keep raw if normalization fails
  }
  const banned = await prisma.bannedPhone.findFirst({
    where: { OR: [{ phone: normalized }, { phone: phone.trim() }] },
  });
  return Boolean(banned);
}
