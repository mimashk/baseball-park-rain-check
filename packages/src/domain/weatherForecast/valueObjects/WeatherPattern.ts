import { WeatherCodeCatalog } from "./WeatherCodeCatalog";

export class WeatherPattern {
  private constructor(
    private readonly _code: number,
    private readonly _labelJa: string
  ) {}

  static fromCode(code: number): WeatherPattern {
    this.validate(code);
    const label = WeatherCodeCatalog[code];
    return new WeatherPattern(code, label);
  }

  labelJa(): string {
    return this._labelJa;
  }

  private static validate(code: number): void {
    if (!Number.isInteger(code)) {
      throw new Error("天気コードは整数でなければなりません");
    }
    if (Object.keys(WeatherCodeCatalog).includes(code.toString())) {
      throw new Error(`未知の天気コードです: ${code}`);
    }
  }
}
