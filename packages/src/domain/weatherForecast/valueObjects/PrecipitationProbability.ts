import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureNumberPresent } from "../../shared/utils/ensurePresent";
import { ensureProbability } from "../../shared/utils/ensureProbability";

export class PrecipitationProbability {
  private constructor(private readonly rate: number) {}

  static fromRate(value: number): PrecipitationProbability {
    const normalizedValue = ensureNumberPresent("降水確率", value);
    const normalizedProbability = ensureProbability(
      "降水確率",
      normalizedValue
    );
    return new PrecipitationProbability(normalizedProbability);
  }

  toPercent(): number {
    return this.rate * 100;
  }

  toRate(): number {
    return this.rate;
  }
}
