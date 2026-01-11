import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensurePositiveInteger } from "../../shared/ensurePositiveInteger";
import { WeatherCodeCatalog } from "./WeatherCodeCatalog";

export class WeatherPattern {
  private constructor(
    private readonly _code: number,
    private readonly _labelJa: string
  ) {}

  static fromCode(code: number): WeatherPattern {
    this.validate(code);
    const label =
      WeatherCodeCatalog[code as keyof typeof WeatherCodeCatalog];
    return new WeatherPattern(code, label);
  }

  labelJa(): string {
    return this._labelJa;
  }

  private static validate(code: number): void {
    const normalizedCode = ensurePositiveInteger("天気コード", code);
    if (!Object.keys(WeatherCodeCatalog).includes(normalizedCode.toString())) {
      throw new DomainError("未知の天気コードです", { code });
    }
  }

  code(): number {
    return this._code;
  }
}
