import { requireNativeModule } from "expo-modules-core";

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
  requireNativeModule<LifecycleNativeModule>("LifecycleState");

export const isLifecycleAvailable = () =>
  LifecycleState.isAvailable();

export const startSession = () =>
  LifecycleState.startSession();

export const endSession = () =>
  LifecycleState.endSession();

export const wasClosedDuringSession = () =>
  LifecycleState.wasClosedDuringSession();

export const getPreviousSessionInterrupted = () =>
  LifecycleState.getPreviousSessionInterrupted();

export const getLastLeaveType = () =>
  LifecycleState.getLastLeaveType();

export const getLastEvent = () =>
  LifecycleState.getLastEvent();

export const getLockSignalDelay = () =>
  LifecycleState.getLockSignalDelay();

export const isCallActive = () =>
  LifecycleState.isCallActive();

export const readEvents = () =>
  LifecycleState.readEvents();