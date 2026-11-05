const INDIA_OFFSET_MINUTES = 5 * 60 + 30;

export function toIndiaISOString(date: Date = new Date()): string {
  const indiaTime = new Date(date.getTime() + INDIA_OFFSET_MINUTES * 60_000);
  return `${indiaTime.toISOString().slice(0, -1)}+05:30`;
}
