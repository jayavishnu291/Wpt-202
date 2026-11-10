import SessionMonitorModule from './SessionMonitorModule';
import type { SessionKind } from './SessionMonitor.types';

export { default } from './SessionMonitorModule';
export type { SessionEvent, SessionEventType, SessionKind } from './SessionMonitor.types';

export const serviceType = SessionMonitorModule.serviceType;
export const startTestSession = (kind: SessionKind, plannedEndMs: number) =>
  SessionMonitorModule.startTestSession(kind, plannedEndMs);
export const stopSession = () => SessionMonitorModule.stopSession();
export const stopServiceForTest = () => SessionMonitorModule.stopServiceForTest();
export const readEvents = () => SessionMonitorModule.readEvents();
