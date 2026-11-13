import * as fs from "fs";
import * as path from "path";

// Mutable mocks so each test controls what the "native" modules return.
jest.mock("expo-device", () => ({ __esModule: true }));
jest.mock("expo-application", () => ({ __esModule: true }));
const mockDevice = jest.requireMock("expo-device") as Record<string, unknown>;
const mockApp = jest.requireMock("expo-application") as Record<string, unknown>;

beforeEach(() => {
  Object.assign(mockDevice, { brand: "Samsung", modelName: "SM-TEST", osName: "Android", osVersion: "14" });
  Object.assign(mockApp, { nativeApplicationVersion: "1.2.3" });
});

import { getDeviceInfo } from "./deviceInfo";
import {
  FAKE_DEVICE_INFO,
  createFakeDeviceInfoProvider,
  getFakeDeviceInfo,
} from "./deviceInfo.fake";
import { formatDeviceInfoLines, logDeviceInfoInDev } from "./devDeviceInfo";
import { buildFeedbackBody } from "./feedbackBody";
import { needsBrandGuide } from "./brandGuide";

describe("getDeviceInfo (real wrapper, mocked Expo)", () => {
  test("maps the five fields", () => {
    expect(getDeviceInfo()).toEqual({
      brand: "Samsung",
      model: "SM-TEST",
      osName: "Android",
      osVersion: "14",
      appVersion: "1.2.3",
    });
  });

  test("feeds needsBrandGuide", () => {
    expect(needsBrandGuide(getDeviceInfo().brand ?? "")).toBe(true);
  });

  test("null / empty native values become null, never fake data", () => {
    Object.assign(mockDevice, { brand: null, modelName: "  ", osName: undefined, osVersion: null });
    Object.assign(mockApp, { nativeApplicationVersion: null });
    expect(getDeviceInfo()).toEqual({
      brand: null, model: null, osName: null, osVersion: null, appVersion: null,
    });
  });
});

describe("fake DeviceInfo", () => {
  test("predictable, same shape as real", () => {
    expect(Object.keys(getFakeDeviceInfo()).sort()).toEqual(Object.keys(getDeviceInfo()).sort());
    expect(getFakeDeviceInfo()).toEqual(FAKE_DEVICE_INFO);
  });
  test("overrides and provider factory", () => {
    expect(createFakeDeviceInfoProvider({ brand: "Xiaomi" })().brand).toBe("Xiaomi");
  });
  test("real wrapper never imports the fake (no fake data in production)", () => {
    const src = fs.readFileSync(path.join(__dirname, "./deviceInfo.ts"), "utf8");
    expect(src).not.toMatch(/from\s+["'][^"']*fake/i);
    expect(src).not.toMatch(/require\(["'][^"']*fake/i);
  });
});

describe("dev display", () => {
  test("formats five lines", () => {
    expect(formatDeviceInfoLines(getFakeDeviceInfo())).toHaveLength(5);
  });
  test("logs in dev, silent when __DEV__ is false", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    (global as any).__DEV__ = true;
    logDeviceInfoInDev(() => getFakeDeviceInfo());
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockClear();
    (global as any).__DEV__ = false;
    logDeviceInfoInDev(() => getFakeDeviceInfo());
    expect(spy).not.toHaveBeenCalled();
    (global as any).__DEV__ = true;
    spy.mockRestore();
  });
});

describe("buildFeedbackBody (FR-SU-02)", () => {
  test("contains app version, OS version, model", () => {
    const body = buildFeedbackBody(getFakeDeviceInfo());
    expect(body).toContain("App version: 0.0.0-fake");
    expect(body).toContain("OS version: 14");
    expect(body).toContain("Phone model: Fake Model 1");
  });
  test("missing values show unknown", () => {
    expect(buildFeedbackBody({ appVersion: null, osVersion: null, model: null }))
      .toContain("Phone model: unknown");
  });
});
