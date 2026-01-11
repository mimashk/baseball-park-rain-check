import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureNumberPresent } from "../../shared/utils/ensurePresent";

export class RainFall {
  private constructor(private readonly value: number) {}

  static fromMillimeters(value: number): RainFall {
    const normalizedValue = ensureNumberPresent("降水量", value);
    if (normalizedValue < 0 || normalizedValue > 100)
      throw new ValidationError("降水量の範囲外です", {
        rainFall: normalizedValue,
      });
    return new RainFall(normalizedValue);
  }

  toNumber(): number {
    return this.value;
  }
}
