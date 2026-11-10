
import { requireNativeModule } from 'expo-modules-core';

type WPT202AlarmKitModuleType = {
  isAlarmKitAvailable(): boolean;
  requestAlarmPermission(): Promise<boolean>;
};

const WPT202AlarmKit =
  requireNativeModule<WPT202AlarmKitModuleType>('WPT202AlarmKit');

export function isAlarmKitAvailable(): boolean {
  return WPT202AlarmKit.isAlarmKitAvailable();
}

export async function requestAlarmPermission(): Promise<boolean> {
  return await WPT202AlarmKit.requestAlarmPermission();
}