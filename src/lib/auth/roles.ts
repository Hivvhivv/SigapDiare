// Aturan role. Fungsi murni; lihat ARCHITECTURE.md §6.

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export const ROLE_LABEL: Record<Role, string> = {
  USER: "Responden",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

/** Admin atau Super Admin (boleh masuk panel admin). */
export function isStaff(role: Role | null | undefined): role is "ADMIN" | "SUPER_ADMIN" {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** Hanya Super Admin yang boleh mengelola akun admin. */
export function canManageAdmins(role: Role | null | undefined) {
  return role === "SUPER_ADMIN";
}

export type AdminChange = { role?: "ADMIN" | "SUPER_ADMIN"; banned?: boolean };

/**
 * Cek perubahan akun admin oleh Super Admin. Mengembalikan pesan kesalahan, atau null bila boleh.
 * - Tidak boleh menonaktifkan / menurunkan role akun sendiri.
 * - Harus selalu ada minimal satu Super Admin aktif.
 */
export function adminChangeError(input: {
  actorId: string;
  target: { id: string; role: Role; banned: boolean };
  change: AdminChange;
  activeSuperAdmins: number;
}): string | null {
  const { actorId, target, change, activeSuperAdmins } = input;
  if (!isStaff(target.role)) return "Akun ini bukan akun admin.";

  const deactivating = change.banned === true && !target.banned;
  const demoting = change.role === "ADMIN" && target.role === "SUPER_ADMIN";

  if (target.id === actorId && (deactivating || demoting)) {
    return "Anda tidak dapat menonaktifkan atau menurunkan role akun sendiri.";
  }
  if (target.role === "SUPER_ADMIN" && !target.banned && (deactivating || demoting) && activeSuperAdmins <= 1) {
    return "Harus ada minimal satu Super Admin aktif.";
  }
  return null;
}
