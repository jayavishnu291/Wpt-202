import { needsBrandGuide } from "../../src/domain/brandGuide";

const SUPPORTED = [
  "Xiaomi", "Redmi", "POCO", "Oppo", "Realme", "OnePlus",
  "Vivo", "Samsung", "Huawei", "Honor", "Tecno", "Infinix",
];

describe("needsBrandGuide", () => {
  test.each(SUPPORTED)("%s -> true", (brand) => {
    expect(needsBrandGuide(brand)).toBe(true);
  });

  test.each(SUPPORTED)("%s works in UPPERCASE and lowercase", (brand) => {
    expect(needsBrandGuide(brand.toUpperCase())).toBe(true);
    expect(needsBrandGuide(brand.toLowerCase())).toBe(true);
  });

  test("mixed case", () => {
    expect(needsBrandGuide("xIaOmI")).toBe(true);
    expect(needsBrandGuide("oNePlUs")).toBe(true);
  });

  test("trims whitespace", () => {
    expect(needsBrandGuide("  Samsung ")).toBe(true);
    expect(needsBrandGuide("\tvivo\n")).toBe(true);
  });

  test.each(["Google", "Apple", "Motorola", "Nothing", "google", "APPLE"])(
    "%s -> false",
    (brand) => {
      expect(needsBrandGuide(brand)).toBe(false);
    },
  );

  test("empty and whitespace-only -> false", () => {
    expect(needsBrandGuide("")).toBe(false);
    expect(needsBrandGuide("   ")).toBe(false);
  });

  test("no partial matching", () => {
    expect(needsBrandGuide("Samsungx")).toBe(false);
    expect(needsBrandGuide("Sams")).toBe(false);
    expect(needsBrandGuide("Xiaomi Inc")).toBe(false);
    expect(needsBrandGuide("notvivo")).toBe(false);
    expect(needsBrandGuide("One Plus")).toBe(false);
  });

  test("null / undefined at runtime -> false, no throw", () => {
    expect(needsBrandGuide(null as unknown as string)).toBe(false);
    expect(needsBrandGuide(undefined as unknown as string)).toBe(false);
  });

  test("does not modify the input", () => {
    const input = "  Samsung ";
    needsBrandGuide(input);
    expect(input).toBe("  Samsung ");
  });
});
