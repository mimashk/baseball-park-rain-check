import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureNumberPresent } from "../../shared/utils/ensurePresent";
import { ensureProbability } from "../../shared/utils/ensureProbability";

export class CancellationProbability {
  private constructor(private readonly value: number) {}

  static from(value: number): CancellationProbability {
    const normalizedValue = ensureNumberPresent("キャンセル確率", value);
    const normalizedProbability = ensureProbability(
      "キャンセル確率",
      normalizedValue
    );
    return new CancellationProbability(normalizedProbability);
  }

  toNumber(): number {
    return this.value;
  }
}
