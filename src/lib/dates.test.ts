import { describe, expect, it } from "vitest";
import {
  ageInMonths,
  dateOnlyToUtc,
  formatAge,
  jakartaLocalToUtc,
  localDateString,
  todayAsDateOnly,
  utcToJakartaLocalInput,
} from "./dates";

describe("jakartaLocalToUtc / utcToJakartaLocalInput", () => {
  it("mengubah waktu WIB dari input datetime-local ke UTC dan kembali", () => {
    const utc = jakartaLocalToUtc("2026-11-20T08:00");
    expect(utc?.toISOString()).toBe("2026-11-20T01:00:00.000Z");
    expect(utcToJakartaLocalInput(utc)).toBe("2026-11-20T08:00");
  });

  it("melewati tengah malam dengan benar", () => {
    expect(jakartaLocalToUtc("2026-11-20T03:30")?.toISOString()).toBe("2026-11-19T20:30:00.000Z");
  });

  it("kosong atau format salah → null / string kosong", () => {
    expect(jakartaLocalToUtc("")).toBeNull();
    expect(jakartaLocalToUtc("20-11-2026 08:00")).toBeNull();
    expect(utcToJakartaLocalInput(null)).toBe("");
  });
});

describe("localDateString", () => {
  it("memakai zona waktu Asia/Jakarta (UTC+7)", () => {
    // 17:30 UTC = 00:30 WIB hari berikutnya
    expect(localDateString(new Date("2026-11-16T17:30:00Z"))).toBe("2026-11-17");
    expect(localDateString(new Date("2026-11-16T16:59:00Z"))).toBe("2026-11-16");
  });
});

describe("todayAsDateOnly", () => {
  it("menghasilkan tengah malam UTC dari tanggal lokal", () => {
    expect(todayAsDateOnly("Asia/Jakarta", new Date("2026-11-16T17:30:00Z")).toISOString()).toBe(
      "2026-11-17T00:00:00.000Z",
    );
  });
});

describe("ageInMonths", () => {
  const birth = dateOnlyToUtc("2024-08-20");
  it.each([
    ["2024-08-20", 0],
    ["2024-09-19", 0],
    ["2024-09-20", 1],
    ["2026-11-17", 26],
    ["2026-11-20", 27],
  ])("pada %s → %i bulan", (today, months) => {
    expect(ageInMonths(birth, dateOnlyToUtc(today))).toBe(months);
  });
});

describe("formatAge", () => {
  it.each([
    [0, "kurang dari 1 bulan"],
    [7, "7 bulan"],
    [12, "1 tahun"],
    [27, "2 tahun 3 bulan"],
  ])("%i → %s", (months, text) => {
    expect(formatAge(months)).toBe(text);
  });
});
