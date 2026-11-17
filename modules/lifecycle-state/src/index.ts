
import { requireOptionalNativeModule } from "expo-modules-core";

export type LifecycleEvent = {
  seq: number;
  action: "leave" | "return";
  at: string;
  elapsed: number;
  type: "lock" | "switch" | "call" | "unknown";
};

type LifecycleNativeModule = {
  isAvailable(): boolean;
  startSession(): void;
  endSession(): void;
  wasClosedDuringSession(): boolean;
  getPreviousSessionInterrupted(): boolean;
  getLastLeaveType(): string;
  getLastEvent(): string;
  getLockSignalDelay(): number;
  isCallActive(): boolean;
  readEvents(): LifecycleEvent[];
};

const LifecycleState =
  requireOptionalNativeModule<LifecycleNativeModule>(
    "LifecycleState"
  );

export const isLifecycleAvailable = (): boolean =>
  LifecycleState?.isAvailable() ?? false;

export const startSession = (): void => {
  LifecycleState?.startSession();
};

export const endSession = (): void => {
  LifecycleState?.endSession();
};

export const wasClosedDuringSession = (): boolean =>
  LifecycleState?.wasClosedDuringSession() ?? false;

export const getPreviousSessionInterrupted = (): boolean =>
  LifecycleState?.getPreviousSessionInterrupted() ?? false;

export const getLastLeaveType = (): string =>
  LifecycleState?.getLastLeaveType() ?? "unknown";

export const getLastEvent = (): string =>
  LifecycleState?.getLastEvent() ?? "";

export const getLockSignalDelay = (): number =>
  LifecycleState?.getLockSignalDelay() ?? 0;

export const isCallActive = (): boolean =>
  LifecycleState?.isCallActive() ?? false;

export const readEvents = (): LifecycleEvent[] =>
  LifecycleState?.readEvents() ?? [];
