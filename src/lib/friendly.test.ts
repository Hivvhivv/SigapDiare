import { describe, expect, it } from "vitest";
import { checklistEncouragement, firstName, timeGreeting } from "./friendly";

describe("timeGreeting (WIB = UTC+7)", () => {
  it.each([
    ["2026-11-17T00:00:00Z", "Selamat pagi"], // 07.00 WIB
    ["2026-11-17T05:00:00Z", "Selamat siang"], // 12.00 WIB
    ["2026-11-17T09:00:00Z", "Selamat sore"], // 16.00 WIB
    ["2026-11-17T13:00:00Z", "Selamat malam"], // 20.00 WIB
    ["2026-11-16T20:30:00Z", "Selamat malam"], // 03.30 WIB
    ["2026-11-16T21:00:00Z", "Selamat pagi"], // 04.00 WIB
  ])("%s → %s", (iso, greeting) => {
    expect(timeGreeting(new Date(iso))).toBe(greeting);
  });
});

describe("firstName", () => {
  it("mengambil kata pertama", () => {
    expect(firstName("Sarah Wulandari")).toBe("Sarah");
    expect(firstName("  Budi  ")).toBe("Budi");
  });
});

describe("checklistEncouragement", () => {
  it.each([
    [0, 0, /disiapkan/],
    [0, 7, /mulai dari satu/],
    [2, 7, /sudah 2 kebiasaan\. Tinggal 5/],
    [4, 7, /tinggal 3 lagi/],
    [7, 7, /Luar biasa/],
  ])("%i dari %i", (done, total, pattern) => {
    expect(checklistEncouragement(done, total)).toMatch(pattern);
  });
});
