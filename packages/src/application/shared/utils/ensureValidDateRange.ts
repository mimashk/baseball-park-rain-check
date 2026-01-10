import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDate } from "./ensureValidDate";

export function ensureValidDateRange(
  fieldFrom: string,
  fieldTo: string,
  from: Date,
  to: Date
): { from: Date; to: Date } {
  const normalizedFrom = ensureValidDate(fieldFrom, from);
  const normalizedTo = ensureValidDate(fieldTo, to);
  if (normalizedFrom > normalizedTo) {
    throw new ValidationError("開始日は終了日より前の日付を指定してください", {
      [fieldFrom]: from,
      [fieldTo]: to,
    });
  }
  return { from, to };
}
