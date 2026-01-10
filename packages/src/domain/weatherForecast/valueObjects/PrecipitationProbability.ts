import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureNumberPresent } from "../../shared/ensurePresent";
import { ensureProbability } from "../../shared/ensureProbability";

export class PrecipitationProbability {
  private constructor(private readonly percent: number) {}

  static fromPercent(value: number): PrecipitationProbability {
    const normalizedValue = ensureNumberPresent("降水確率", value);
    const normalizedProbability = ensureProbability(
      "降水確率",
      normalizedValue
    );
    return new PrecipitationProbability(normalizedProbability);
  }

  toPercent(): number {
    return this.percent;
  }
}
