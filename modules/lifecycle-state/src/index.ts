
import { requireNativeModule } from 'expo-modules-core';

type LifecycleStateNativeModule = {
  isAvailable(): boolean;
  getLastEvent(): string;
  getLockSignalDelay(): number;
  getPreviousSessionInterrupted(): boolean;
};

const LifecycleState =
  requireNativeModule<LifecycleStateNativeModule>(
    'LifecycleState'
  );

export function isLifecycleAvailable(): boolean {
  return LifecycleState.isAvailable();
}

export function getLastEvent(): string {
  return LifecycleState.getLastEvent();
}

export function getLockSignalDelay(): number {
  return LifecycleState.getLockSignalDelay();
}

export function getPreviousSessionInterrupted(): boolean {
  return LifecycleState.getPreviousSessionInterrupted();
}
