import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureNumberPresent } from "../../shared/utils/ensurePresent";

export class TemperatureCelsius {
  private constructor(private readonly value: number) {}

  static from(value: number): TemperatureCelsius {
    const normalizedValue = ensureNumberPresent("気温", value);
    if (normalizedValue < -20 || normalizedValue > 50)
      throw new ValidationError("気温の範囲外です", {
        temperature: normalizedValue,
      });
    return new TemperatureCelsius(normalizedValue);
  }

  toNumber(): number {
    return this.value;
  }
}
