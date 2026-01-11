import { ValidationError } from "../../../shared/errors/ValidationError";

export function ensureNumberPresent(
  label: string,
  value: number | null | undefined
): number {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    throw new ValidationError(`${label} は必須です`);
  }
  return value;
}

export function ensureDatePresent(
  label: string,
  value: Date | null | undefined
): Date {
  if (value === undefined || value === null) {
    throw new ValidationError(`${label} は必須です`);
  }
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ValidationError(`${label} は日付ではありません`);
  }
  return value;
}

export function ensureTextPresent(
  label: string,
  value: string | null | undefined
): string {
  if (value === undefined || value === null || value.trim().length === 0) {
    throw new ValidationError(`${label} が空です`, { value });
  }
  return value;
}
export function ensureBooleanPresent(
  label: string,
  value: boolean | null | undefined
): boolean {
  if (value === undefined || value === null || typeof value !== "boolean") {
    throw new ValidationError(`${label} は必須です`);
  }
  return value;
}
