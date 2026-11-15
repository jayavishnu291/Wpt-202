import { toIsoWithOffset } from '../domain/time';

export function toLocalISOString(date: Date = new Date()): string {
  return toIsoWithOffset(date.getTime(), -date.getTimezoneOffset());
}
