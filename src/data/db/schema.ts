
export const SCHEMA_VERSION = 1;

export const INITIAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  bedtime TEXT NOT NULL DEFAULT '23:00',
  window_start TEXT NOT NULL DEFAULT '19:00',
  default_wake_time TEXT NOT NULL DEFAULT '07:00',
  sleep_goal_min INTEGER NOT NULL DEFAULT 480,
  allowance_min INTEGER NOT NULL DEFAULT 60,
  reminder_on INTEGER NOT NULL DEFAULT 1,
  reminder_offset_min INTEGER NOT NULL DEFAULT 15,
  default_focus_min INTEGER NOT NULL DEFAULT 25,
  focus_goal_min INTEGER NOT NULL DEFAULT 60,
  session_sound_on INTEGER NOT NULL DEFAULT 1,
  crash_reports_on INTEGER NOT NULL DEFAULT 1,
  same_block_list INTEGER NOT NULL DEFAULT 1,
  install_date TEXT,
  onboarding_done INTEGER NOT NULL DEFAULT 0,
  rating_asked INTEGER NOT NULL DEFAULT 0,
  bedtime_changed_at TEXT
);

CREATE TABLE IF NOT EXISTS alarms (
  id TEXT PRIMARY KEY NOT NULL,
  time TEXT NOT NULL,
  repeat_days TEXT NOT NULL DEFAULT '[]',
  label TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  mission_type TEXT,
  level INTEGER,
  count INTEGER,
  sound TEXT,
  vibration INTEGER NOT NULL DEFAULT 1,
  snooze_on INTEGER NOT NULL DEFAULT 1,
  snoozes_used INTEGER NOT NULL DEFAULT 0,
  next_trigger_at TEXT,
  skip_next INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  start_at TEXT NOT NULL,
  planned_min INTEGER NOT NULL,
  end_at TEXT,
  result TEXT CHECK (result IN ('bloom', 'bud')),
  pass_used INTEGER NOT NULL DEFAULT 0,
  leave_events TEXT NOT NULL DEFAULT '[]',
  unknown_periods TEXT NOT NULL DEFAULT '[]',
  question_answer TEXT,
  label TEXT,
  flower_seed TEXT,
  size_class TEXT,
  rare INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS nights (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('night', 'nap')),
  late_start INTEGER NOT NULL DEFAULT 0,
  start_at TEXT NOT NULL,
  end_at TEXT,
  end_reason TEXT CHECK (
    end_reason IN (
      'alarm', 'alarm_stop_no_mission', 'awake', 'wake_point', 'auto'
    )
  ),
  wake_result TEXT CHECK (
    wake_result IN (
      'mission', 'mission_snoozed', 'no_mission', 'none'
    )
  ),
  snooze_count INTEGER NOT NULL DEFAULT 0,
  mission_done_at TEXT,
  sleep_day TEXT,
  pickups_count INTEGER NOT NULL DEFAULT 0,
  pass_used INTEGER NOT NULL DEFAULT 0,
  unknown_periods TEXT NOT NULL DEFAULT '[]',
  question_needed INTEGER NOT NULL DEFAULT 0,
  question_answer TEXT,
  onset_at TEXT,
  est_sleep_min INTEGER,
  score_parts TEXT,
  score REAL,
  star TEXT CHECK (star IN ('star', 'faint', 'none')),
  counted_for_star INTEGER NOT NULL DEFAULT 0,
  manual_edit INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS phone_use (
  night_id TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('use', 'away')),
  counted_as_pickup INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (night_id, start_at),
  FOREIGN KEY (night_id) REFERENCES nights(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS device_events (
  session_kind TEXT NOT NULL CHECK (
    session_kind IN ('focus', 'night', 'nap')
  ),
  session_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('heartbeat', 'shutdown', 'boot', 'session_end')
  ),
  at TEXT NOT NULL,
  PRIMARY KEY (session_id, type, at)
);

CREATE TABLE IF NOT EXISTS streaks (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  night_current INTEGER NOT NULL DEFAULT 0,
  night_best INTEGER NOT NULL DEFAULT 0,
  focus_current INTEGER NOT NULL DEFAULT 0,
  focus_best INTEGER NOT NULL DEFAULT 0,
  rest_nights_used TEXT NOT NULL DEFAULT '[]',
  last_evaluated_day TEXT
);

CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  stars_total INTEGER NOT NULL DEFAULT 0,
  constellations_unlocked TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS block_lists (
  list TEXT NOT NULL CHECK (list IN ('focus', 'night', 'allowed')),
  package_name TEXT NOT NULL,
  PRIMARY KEY (list, package_name)
);

CREATE TABLE IF NOT EXISTS ad_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_ad_shown_date TEXT,
  consent_status TEXT,
  att_asked INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_alarms_enabled
  ON alarms(enabled);

CREATE INDEX IF NOT EXISTS idx_nights_sleep_day
  ON nights(sleep_day);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_end_at
  ON focus_sessions(end_at);
`;
