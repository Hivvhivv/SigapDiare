import "server-only";
import { db } from "../db";

export const SETTING_SUPPORT_WHATSAPP = "support.whatsapp";

/** Nomor WhatsApp admin dalam format wa.me (628…), atau null bila belum diatur. */
export async function getSupportWhatsapp() {
  const setting = await db.siteSetting.findUnique({ where: { key: SETTING_SUPPORT_WHATSAPP } });
  const value = typeof setting?.value === "string" ? setting.value.replace(/\D/g, "") : "";
  return value.length >= 10 ? value : null;
}
