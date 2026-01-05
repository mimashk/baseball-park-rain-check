export class TemperatureCelsius {
  private constructor(private readonly value: number) {}

  static from(value: number): TemperatureCelsius {
    if (value < -20 || value > 50)
      throw new Error(`気温の範囲外です: ${value}`);
    return new TemperatureCelsius(value);
  }

  toNumber(): number {
    return this.value;
  }
}
