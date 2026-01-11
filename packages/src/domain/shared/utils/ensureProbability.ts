import { ValidationError } from "../../../shared/errors/ValidationError";

export function ensureProbability(label: string, value: number): number {
  if (value < 0 || value > 1) {
    throw new ValidationError(`${label}は0から1の間でなければなりません`, {
      value,
    });
  }
  return value;
}
