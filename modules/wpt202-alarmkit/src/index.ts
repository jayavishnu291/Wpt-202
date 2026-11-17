
import { requireOptionalNativeModule } from "expo-modules-core";

type WPT202AlarmKitModuleType = {
  isAlarmKitAvailable: () => boolean;
  requestAlarmPermission: () => Promise<boolean>;
  scheduleAlarm: (
    hour: number,
    minute: number,
    repeatDays: string[]
  ) => Promise<string | null>;
  cancelAlarm: (alarmId: string) => Promise<boolean>;
};

const WPT202AlarmKit =
  requireOptionalNativeModule<WPT202AlarmKitModuleType>(
    "WPT202AlarmKit"
  );

export function isAlarmKitAvailable(): boolean {
  return WPT202AlarmKit?.isAlarmKitAvailable() ?? false;
}

export async function requestAlarmPermission(): Promise<boolean> {
  if (!WPT202AlarmKit) {
    return false;
  }

  return await WPT202AlarmKit.requestAlarmPermission();
}

export async function scheduleAlarm(
  hour: number,
  minute: number,
  repeatDays: string[]
): Promise<string | null> {
  if (!WPT202AlarmKit) {
    return null;
  }

  return await WPT202AlarmKit.scheduleAlarm(
    hour,
    minute,
    repeatDays
  );
}

export async function cancelAlarm(
  alarmId: string
): Promise<boolean> {
  if (!WPT202AlarmKit) {
    return false;
  }

  return await WPT202AlarmKit.cancelAlarm(alarmId);
}
