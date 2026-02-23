const jstPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const toJstDateKeyByParts = (date: Date): string => {
  const parts = jstPartsFormatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format JST date parts");
  }

  return `${year}-${month}-${day}`; // YYYY-MM-DD
};

const addOneDayToDateKey = (dateKey: string): string => {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
};

export const listJstDateKeys = (from: Date, to: Date): string[] => {
  const out: string[] = [];
  let currentKey = toJstDateKeyByParts(from);
  const endKey = toJstDateKeyByParts(to);

  while (currentKey <= endKey) {
    out.push(currentKey);
    currentKey = addOneDayToDateKey(currentKey);
  }

  return out;
};
