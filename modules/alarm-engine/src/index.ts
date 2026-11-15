import { requireNativeModule } from "expo-modules-core";
const AlarmEngine = requireNativeModule("AlarmEngine");
export function isAvailable(): boolean {
  return AlarmEngine.isAvailable();
}
