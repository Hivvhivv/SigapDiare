import { describe, expect, it } from "vitest";
import { phaseFromSlug, windowStatus } from "./window";

const opens = new Date("2026-11-20T01:00:00Z");
const closes = new Date("2026-11-27T01:00:00Z");

describe("windowStatus", () => {
  it("belum dijadwalkan bila tidak ada waktu buka", () => {
    expect(windowStatus(null, closes, new Date("2026-11-21T00:00:00Z"))).toBe("UNSCHEDULED");
    expect(windowStatus(undefined, undefined, new Date())).toBe("UNSCHEDULED");
  });

  it("akan datang sebelum waktu buka", () => {
    expect(windowStatus(opens, closes, new Date("2026-11-20T00:59:59Z"))).toBe("UPCOMING");
  });

  it("terbuka tepat saat waktu buka sampai sebelum waktu tutup", () => {
    expect(windowStatus(opens, closes, opens)).toBe("OPEN");
    expect(windowStatus(opens, closes, new Date("2026-11-27T00:59:59Z"))).toBe("OPEN");
  });

  it("tertutup tepat saat waktu tutup", () => {
    expect(windowStatus(opens, closes, closes)).toBe("CLOSED");
  });

  it("tanpa waktu tutup tetap terbuka", () => {
    expect(windowStatus(opens, null, new Date("2030-01-01T00:00:00Z"))).toBe("OPEN");
  });
});

describe("phaseFromSlug", () => {
  it("memetakan slug URL ke fase", () => {
    expect(phaseFromSlug("pretest")).toBe("PRETEST");
    expect(phaseFromSlug("posttest")).toBe("POSTTEST");
    expect(phaseFromSlug("PRETEST")).toBeNull();
    expect(phaseFromSlug("lain")).toBeNull();
  });
});
