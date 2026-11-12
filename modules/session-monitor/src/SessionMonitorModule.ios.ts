import type { SessionEvent, SessionKind } from './SessionMonitor.types';

const androidOnly = async (): Promise<never> => {
  throw new Error('Session monitoring is currently available only on Android.');
};

const SessionMonitorModule = {
  serviceType: 'specialUse',
  startTestSession: (_kind: SessionKind, _plannedEndMs: number) => androidOnly(),
  stopSession: () => androidOnly(),
  stopServiceForTest: () => androidOnly(),
  readEvents: (): Promise<SessionEvent[]> => androidOnly(),
};

export default SessionMonitorModule;
