import { describe, expect, it } from "vitest";
import { formatPhone, normalizeIndonesianPhone } from "./phone";

describe("normalizeIndonesianPhone", () => {
  it.each([
    ["081234567890", "+6281234567890"],
    ["0812-3456-7890", "+6281234567890"],
    ["0812 3456 7890", "+6281234567890"],
    ["6281234567890", "+6281234567890"],
    ["+62 812 3456 7890", "+6281234567890"],
    ["0812345678", "+62812345678"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeIndonesianPhone(input)).toBe(expected);
  });

  it.each(["", "12345", "0212345678", "+1 555 123 4567", "08123", "08123456789012345", "0812abc4567"])(
    "menolak %s",
    (input) => {
      expect(normalizeIndonesianPhone(input)).toBeNull();
    },
  );
});

describe("formatPhone", () => {
  it("menampilkan format lokal", () => {
    expect(formatPhone("+6281234567890")).toBe("0812-3456-7890");
  });
});
