const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function toJstDateString(dateUtc: Date) {
  const jst = new Date(dateUtc.getTime() + JST_OFFSET_MS);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function jstDayRangeUtc(dateJst: string) {
  const startUtc = new Date(`${dateJst}T00:00:00+09:00`);
  const endUtc = new Date(`${dateJst}T23:59:59.999+09:00`);
  return { startUtc, endUtc };
}

export function addDaysJst(dateJst: string, days: number) {
  const base = new Date(`${dateJst}T00:00:00+09:00`);
  base.setDate(base.getDate() + days);
  return toJstDateString(new Date(base.getTime() - JST_OFFSET_MS));
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function floorToJstHourUtc(dateUtc: Date) {
  const jst = new Date(dateUtc.getTime() + JST_OFFSET_MS);
  jst.setUTCMinutes(0, 0, 0);
  return new Date(jst.getTime() - JST_OFFSET_MS);
}

export function toHourKeyUtc(dateUtc: Date) {
  return Date.UTC(
    dateUtc.getUTCFullYear(),
    dateUtc.getUTCMonth(),
    dateUtc.getUTCDate(),
    dateUtc.getUTCHours()
  );
}
