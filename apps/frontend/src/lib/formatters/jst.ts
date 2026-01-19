const dateFmt = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFmt = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  weekday: "short",
});

const timeFmt = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateTimeFmt = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function fmtDate(isoUtc: string) {
  const d = new Date(isoUtc);
  return `${dateFmt.format(d)} (${weekdayFmt.format(d)})`;
}

export function fmtTime(isoUtc: string) {
  return timeFmt.format(new Date(isoUtc));
}

export function fmtUpdate(isoUtc: string) {
  return dateTimeFmt.format(new Date(isoUtc));
}
