import englishCopy from "../locales/en.json";

/**
 * Read user-facing copy by key path, e.g. t("s01.title").
 * Missing keys return the key itself so missing copy is easy to find during development.
 */
export function t(key) {
  const value = key.split(".").reduce((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return current[part];
    }
    return undefined;
  }, englishCopy);

  return typeof value === "string" ? value : `[missing copy: ${key}]`;
}