export type RainfallOccurredType = "OCCURRED" | "NOT_OCCURRED";

export class RainfallOccurred {
  private constructor(readonly value: RainfallOccurredType) {}

  static occurred(): RainfallOccurred {
    return new RainfallOccurred("OCCURRED");
  }

  static notOccurred(): RainfallOccurred {
    return new RainfallOccurred("NOT_OCCURRED");
  }

  static fromBoolean(isOccurred: boolean): RainfallOccurred {
    return isOccurred
      ? RainfallOccurred.occurred()
      : RainfallOccurred.notOccurred();
  }

  toNumber(): number {
    return this.value === "OCCURRED" ? 1 : 0;
  }
}
