// Fake DeviceInfo for screens under development and for tests (no phone needed).
// Import this ONLY from tests or dev tooling; production code uses ./deviceInfo.
import type { DeviceInfo, DeviceInfoProvider } from "./deviceInfo";

export const FAKE_DEVICE_INFO: Readonly<DeviceInfo> = Object.freeze({
  brand: "FakeBrand",
  model: "Fake Model 1",
  osName: "Android",
  osVersion: "14",
  appVersion: "0.0.0-fake",
});

/** Returns a fresh copy; pass overrides to simulate other phones. */
export const getFakeDeviceInfo = (
  overrides: Partial<DeviceInfo> = {},
): DeviceInfo => ({ ...FAKE_DEVICE_INFO, ...overrides });

/** Provider factory: createFakeDeviceInfoProvider({ brand: "Samsung" }). */
export const createFakeDeviceInfoProvider =
  (overrides: Partial<DeviceInfo> = {}): DeviceInfoProvider =>
  () =>
    getFakeDeviceInfo(overrides);
