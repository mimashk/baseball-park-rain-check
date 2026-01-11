import { ensureNonNegativeInteger } from "../../shared/utils/ensureNonNegativeInteger";
import { DomainError } from "../../../shared/errors/DomainError";
import { WeatherCategory, WeatherCodeCatalog } from "./WeatherCodeCatalog";

export class WeatherPattern {
  private constructor(
    private readonly _code: number,
    private readonly _labelJa: string,
    private readonly _category: WeatherCategory
  ) {}

  static fromCode(code: number): WeatherPattern {
    this.validate(code);
    const label = WeatherCodeCatalog[code];
    return new WeatherPattern(code, label.labelJa, label.category);
  }

  labelJa(): string {
    return this._labelJa;
  }

  private static validate(code: number): void {
    const normalizedCode = ensureNonNegativeInteger("天気コード", code);
    if (!Object.keys(WeatherCodeCatalog).includes(normalizedCode.toString())) {
      throw new DomainError("未知の天気コードです", { code });
    }
  }

  code(): number {
    return this._code;
  }
}
