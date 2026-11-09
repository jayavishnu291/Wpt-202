import { requireNativeModule } from 'expo-modules-core';

type WPT202AlarmKitModuleType = {
  isAlarmKitAvailable(): boolean;
};

const WPT202AlarmKit =
  requireNativeModule<WPT202AlarmKitModuleType>('WPT202AlarmKit');

export function isAlarmKitAvailable(): boolean {
  return WPT202AlarmKit.isAlarmKitAvailable();
}
