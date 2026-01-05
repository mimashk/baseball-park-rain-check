export class RainFall {
  private constructor(private readonly value: number) {}

  static fromMillimeters(value: number): RainFall {
    if (value < 0 || value > 100)
      throw new Error(`降水量の範囲外です: ${value}`);
    return new RainFall(value);
  }

  toNumber(): number {
    return this.value;
  }
}
