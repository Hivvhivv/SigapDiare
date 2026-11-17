import { describe, expect, it } from "vitest";
import { adminChangeError, canManageAdmins, isStaff } from "./roles";

describe("isStaff / canManageAdmins", () => {
  it("admin & super admin adalah staf; responden bukan", () => {
    expect(isStaff("ADMIN")).toBe(true);
    expect(isStaff("SUPER_ADMIN")).toBe(true);
    expect(isStaff("USER")).toBe(false);
    expect(isStaff(null)).toBe(false);
  });

  it("hanya super admin yang mengelola admin", () => {
    expect(canManageAdmins("SUPER_ADMIN")).toBe(true);
    expect(canManageAdmins("ADMIN")).toBe(false);
    expect(canManageAdmins("USER")).toBe(false);
  });
});

describe("adminChangeError", () => {
  const superA = { id: "a", role: "SUPER_ADMIN" as const, banned: false };
  const superB = { id: "b", role: "SUPER_ADMIN" as const, banned: false };
  const admin = { id: "c", role: "ADMIN" as const, banned: false };

  it("tidak boleh menonaktifkan atau menurunkan diri sendiri", () => {
    expect(adminChangeError({ actorId: "a", target: superA, change: { banned: true }, activeSuperAdmins: 2 })).toMatch(/sendiri/);
    expect(adminChangeError({ actorId: "a", target: superA, change: { role: "ADMIN" }, activeSuperAdmins: 2 })).toMatch(/sendiri/);
  });

  it("super admin aktif terakhir tidak boleh dinonaktifkan/diturunkan", () => {
    expect(adminChangeError({ actorId: "x", target: superB, change: { banned: true }, activeSuperAdmins: 1 })).toMatch(/minimal satu/);
    expect(adminChangeError({ actorId: "x", target: superB, change: { role: "ADMIN" }, activeSuperAdmins: 1 })).toMatch(/minimal satu/);
  });

  it("boleh bila masih ada super admin lain", () => {
    expect(adminChangeError({ actorId: "a", target: superB, change: { role: "ADMIN" }, activeSuperAdmins: 2 })).toBeNull();
    expect(adminChangeError({ actorId: "a", target: superB, change: { banned: true }, activeSuperAdmins: 2 })).toBeNull();
  });

  it("admin biasa bebas dinaikkan, dinonaktifkan, diaktifkan", () => {
    expect(adminChangeError({ actorId: "a", target: admin, change: { role: "SUPER_ADMIN" }, activeSuperAdmins: 1 })).toBeNull();
    expect(adminChangeError({ actorId: "a", target: admin, change: { banned: true }, activeSuperAdmins: 1 })).toBeNull();
    expect(
      adminChangeError({ actorId: "a", target: { ...admin, banned: true }, change: { banned: false }, activeSuperAdmins: 1 }),
    ).toBeNull();
  });

  it("menolak akun responden", () => {
    expect(adminChangeError({ actorId: "a", target: { id: "u", role: "USER", banned: false }, change: { banned: true }, activeSuperAdmins: 1 })).toMatch(/bukan akun admin/);
  });
});
