import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("memakai BOM, titik koma, dan CRLF", () => {
    expect(toCsv([["a", 1], ["b", null]])).toBe("﻿a;1\r\nb;\r\n");
  });

  it("mengutip sel yang berisi titik koma, kutip, atau baris baru", () => {
    expect(toCsv([['memberi "oralit"; ASI', "baris\nbaru"]])).toBe('﻿"memberi ""oralit""; ASI";"baris\nbaru"\r\n');
  });

  it("menetralkan sel yang tampak seperti formula", () => {
    expect(toCsv([["=SUM(A1)", "+62", "-1", "@x"]])).toBe("﻿'=SUM(A1);'+62;'-1;'@x\r\n");
  });

  it("angka negatif tetap aman sebagai angka", () => {
    expect(toCsv([[-1]])).toBe("﻿'-1\r\n");
  });
});
