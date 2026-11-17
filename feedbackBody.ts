// FR-SU-02: the feedback email body shows app version, OS version and phone model.
// Pure function; the user can see and edit everything in their email app.
export interface FeedbackDeviceFields {
  appVersion: string | null;
  osVersion: string | null;
  model: string | null;
}

const show = (v: string | null): string => v ?? "unknown";

export function buildFeedbackBody(info: FeedbackDeviceFields): string {
  return [
    "",
    "",
    "---",
    `App version: ${show(info.appVersion)}`,
    `OS version: ${show(info.osVersion)}`,
    `Phone model: ${show(info.model)}`,
  ].join("\n");
}
