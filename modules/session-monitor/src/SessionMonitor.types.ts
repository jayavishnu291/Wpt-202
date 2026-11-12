export type SessionKind = 'focus' | 'night' | 'nap';

export type SessionEventType =
  | 'session_start'
  | 'heartbeat'
  | 'service_found_missing'
  | 'session_end'
  | 'shutdown'
  | 'boot'
  | 'alarm_fallback';

export type SessionEvent = {
  seq: number;
  at: string;
  elapsed: number;
  boot_count: number;
  type: SessionEventType;
  session_id: string;
  kind?: SessionKind;
  planned_end_ms?: number;
  detail?: string;
};
