// Pure domain logic: no React / React Native / Expo imports.
// PRD 9.1.2 (brand list), FR-ON-07 (S-04 shown only for these brands).

/** Lower-case, exact-match brand names that need the battery/background guide. */
const BRAND_GUIDE_BRANDS: ReadonlySet<string> = new Set([
  "xiaomi",
  "redmi",
  "poco",
  "oppo",
  "realme",
  "oneplus",
  "vivo",
  "samsung",
  "huawei",
  "honor",
  "tecno",
  "infinix",
]);

/**
 * True when the phone brand needs the manufacturer-specific guide (S-04).
 * Case-insensitive, ignores surrounding whitespace, exact match only
 * (no partial matching). Non-string / empty input returns false.
 */
export function needsBrandGuide(brand: string): boolean {
  if (typeof brand !== "string") return false;
  return BRAND_GUIDE_BRANDS.has(brand.trim().toLowerCase());
}
