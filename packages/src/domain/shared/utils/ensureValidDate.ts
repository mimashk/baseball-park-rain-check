import { ValidationError } from "../../../shared/errors/ValidationError";

export function ensureValidDate(label: string, raw: Date): Date {
  const normalized = new Date(raw);
  if (Number.isNaN(normalized.getTime())) {
    throw new ValidationError(`${label} が不正です`, { value: raw });
  }
  return normalized;
}
