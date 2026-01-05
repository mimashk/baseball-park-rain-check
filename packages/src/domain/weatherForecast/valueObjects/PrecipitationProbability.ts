export class PrecipitationProbability {
  private constructor(private readonly percent: number) {}

  static fromPercent(percent: number): PrecipitationProbability {
    if (percent < 0 || percent > 100)
      throw new Error(`確率の範囲外です: ${percent}`);
    return new PrecipitationProbability(percent);
  }

  toPercent(): number {
    return this.percent;
  }
}
