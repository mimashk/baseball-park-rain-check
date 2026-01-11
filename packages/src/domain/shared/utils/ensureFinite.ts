// domain/shared/validation.ts

import { ValidationError } from "../../../shared/errors/ValidationError";

export function ensureFiniteNumber(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new ValidationError(`${name} に有限数以外が含まれています`);
  }
}

export function ensureFiniteArray(name: string, values: number[]): void {
  if (values.some((v) => !Number.isFinite(v))) {
    throw new ValidationError(`${name} に有限数以外が含まれています`);
  }
}
