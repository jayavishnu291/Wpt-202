/**
 * The text helper. Screens call t("focus.resultBloom") instead of typing text.
 *   t("focus.resultBloom")                          -> plain sentence
 *   t("alarmRinging.snooze", { count: 2 })          -> "Snooze (2 left)"
 *   t("help.feedbackSubject", { appName: appConfig.appName })
 * A missing key never crashes: dev builds log a warning, the key is shown instead.
 */
import { en } from "./en";

declare const __DEV__: boolean | undefined;

type Paths<T, P extends string = ""> = T extends string
  ? P
  : { [K in keyof T & string]: Paths<T[K], P extends "" ? K : `${P}.${K}`> }[keyof T & string];

/** Every valid key, e.g. "focus.resultBloom". A typo is a compile error. */
export type TextKey = Paths<typeof en>;

type Params = Record<string, string | number>;

const warn = (message: string): void => {
  if (typeof __DEV__ !== "undefined" && __DEV__) console.warn(message);
};

function lookup(key: string): string | undefined {
  const value = key.split(".").reduce<any>((obj, part) => obj?.[part], en);
  return typeof value === "string" ? value : undefined;
}

export function t(key: TextKey, params: Params = {}): string {
  const oneKey = `${key}One`;
  const useOne = params.count === 1 && lookup(oneKey) !== undefined;
  const value = lookup(useOne ? oneKey : key);
  if (value === undefined) {
    warn(`Missing text key: ${key}`);
    return key;
  }
  return value.replace(/\{(\w+)\}/g, (_match, name: string) => {
    if (params[name] === undefined) {
      warn(`Text key "${key}" needs a value for {${name}}`);
      return "";
    }
    return String(params[name]);
  });
}
