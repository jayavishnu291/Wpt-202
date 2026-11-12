
import { requireNativeModule } from 'expo-modules-core';

type WPT202AlarmKitModuleType = {
  isAlarmKitAvailable: () => boolean;
  requestAlarmPermission: () => Promise<boolean>;
  scheduleAlarm: (
    hour: number,
    minute: number,
    repeatDays: string[]
  ) => Promise<boolean>;
};


const WPT202AlarmKit =
  requireNativeModule<WPT202AlarmKitModuleType>('WPT202AlarmKit');

export function isAlarmKitAvailable(): boolean {
  return WPT202AlarmKit.isAlarmKitAvailable();
}

export async function requestAlarmPermission(): Promise<boolean> {
  return await WPT202AlarmKit.requestAlarmPermission();
}


export async function scheduleAlarm(
  hour: number,
  minute: number,
  repeatDays: string[] = []
): Promise<boolean> {
  return await WPT202AlarmKit.scheduleAlarm(
    hour,
    minute,
    repeatDays
  );
}
