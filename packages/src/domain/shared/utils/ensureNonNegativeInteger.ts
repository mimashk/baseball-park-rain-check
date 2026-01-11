import { ValidationError } from "../../../shared/errors/ValidationError";

export function ensureNonNegativeInteger(
  label: string,
  value: number | null | undefined
): number {
  if (
    value === undefined ||
    value === null ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new ValidationError(`${label} は非負の整数でなければなりません`, {
      value,
    });
  }
  return value;
}
