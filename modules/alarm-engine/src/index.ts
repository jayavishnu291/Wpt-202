
import { requireOptionalNativeModule } from "expo-modules-core";

type AlarmEngineModule = {
  canScheduleExactAlarms: () => boolean;
  scheduleTestAlarm: (timeMs: number) => Promise<boolean>;
  cancelTestAlarm: () => Promise<boolean>;
};

const AlarmEngine =
  requireOptionalNativeModule<AlarmEngineModule>("AlarmEngine");

export function isAvailable(): boolean {
  return AlarmEngine !== null;
}

export function canScheduleExactAlarms(): boolean {
  return AlarmEngine?.canScheduleExactAlarms() ?? false;
}

export async function scheduleTestAlarm(
  timeMs: number
): Promise<boolean> {
  if (!AlarmEngine) {
    throw new Error("Android native AlarmEngine module unavailable.");
  }

  return await AlarmEngine.scheduleTestAlarm(timeMs);
}

export async function cancelTestAlarm(): Promise<boolean> {
  if (!AlarmEngine) {
    throw new Error("Android native AlarmEngine module unavailable.");
  }

  return await AlarmEngine.cancelTestAlarm();
}
