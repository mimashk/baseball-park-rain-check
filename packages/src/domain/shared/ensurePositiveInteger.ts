import { ValidationError } from "../../shared/errors/ValidationError";

export function ensurePositiveInteger(
  label: string,
  value: number | null | undefined
): number {
  if (
    value === undefined ||
    value === null ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new ValidationError(`${label} は正の整数でなければなりません`, {
      value,
    });
  }
  return value;
}
