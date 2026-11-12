// Development-only inspection of DeviceInfo. Does nothing in production builds
// (__DEV__ is false there). Local console output only: nothing is sent anywhere.
import type { DeviceInfo, DeviceInfoProvider } from "./deviceInfo";

export const formatDeviceInfoLines = (info: DeviceInfo): string[] => [
  `Brand: ${info.brand ?? "unavailable"}`,
  `Model: ${info.model ?? "unavailable"}`,
  `OS Name: ${info.osName ?? "unavailable"}`,
  `OS Version: ${info.osVersion ?? "unavailable"}`,
  `App Version: ${info.appVersion ?? "unavailable"}`,
];

/** Call once at startup, e.g. logDeviceInfoInDev(getDeviceInfo). */
export function logDeviceInfoInDev(provider: DeviceInfoProvider): void {
  if (!__DEV__) return;
  console.log(["[DeviceInfo]", ...formatDeviceInfoLines(provider())].join("\n  "));
}
