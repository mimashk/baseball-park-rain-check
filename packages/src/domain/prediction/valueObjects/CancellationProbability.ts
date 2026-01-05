export class CancellationProbability {
  private constructor(private readonly value: number) {}

  static from(value: number): CancellationProbability {
    if (!Number.isFinite(value))
      throw new Error("キャンセル確率は有限数でなければなりません");
    if (value < 0 || value > 1)
      throw new Error("キャンセル確率は0から1の間でなければなりません");
    return new CancellationProbability(value);
  }

  toNumber(): number {
    return this.value;
  }
}
