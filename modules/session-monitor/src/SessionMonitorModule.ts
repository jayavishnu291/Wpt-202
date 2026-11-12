import { NativeModule, requireNativeModule } from 'expo';

import type { SessionEvent, SessionKind } from './SessionMonitor.types';

declare class SessionMonitorNativeModule extends NativeModule {
  serviceType: string;
  startTestSession(kind: SessionKind, plannedEndMs: number): Promise<void>;
  stopSession(): Promise<void>;
  stopServiceForTest(): Promise<void>;
  readEvents(): Promise<SessionEvent[]>;
}

export default requireNativeModule<SessionMonitorNativeModule>('SessionMonitor');
