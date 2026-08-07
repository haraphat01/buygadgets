/// Formats a Date for an <input type="datetime-local"> value, in the
/// browser's local timezone (not UTC, which toISOString() alone would give).
export function toDatetimeLocalInput(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}
