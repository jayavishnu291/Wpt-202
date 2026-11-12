// Shared DeviceInfo helper (PRD 14.2). Real implementation: reads the five
// required metadata fields from Expo. Nothing here is stored, logged or sent.
// The fake lives in ./deviceInfo.fake.ts and is never imported from this file.
import * as Application from "expo-application";
import * as Device from "expo-device";

export interface DeviceInfo {
  /** e.g. "Samsung". null when the platform does not provide it. */
  brand: string | null;
  /** e.g. "SM-A546E". */
  model: string | null;
  /** e.g. "Android" or "iOS". */
  osName: string | null;
  /** e.g. "14". */
  osVersion: string | null;
  /** Installed app version, e.g. "1.0.0". */
  appVersion: string | null;
}

/** Anything that can supply DeviceInfo: the real getter or the fake. */
export type DeviceInfoProvider = () => DeviceInfo;

const clean = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/** Reads real device info. Unavailable values are null, never invented. */
export const getDeviceInfo: DeviceInfoProvider = () => ({
  brand: clean(Device.brand),
  model: clean(Device.modelName),
  osName: clean(Device.osName),
  osVersion: clean(Device.osVersion),
  appVersion: clean(Application.nativeApplicationVersion),
});
