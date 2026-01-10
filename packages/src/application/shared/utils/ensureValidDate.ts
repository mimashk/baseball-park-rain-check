import { ValidationError } from "../../../shared/errors/ValidationError";

export function ensureValidDate(fieldName: string, date: Date): Date {
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("日付が不正です", {
      [fieldName]: date.toISOString(),
    });
  }
  return date;
}
