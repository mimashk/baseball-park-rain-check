export class ModelVersion {
  private constructor(private readonly _value: string) {}

  static fromDate(date: Date): ModelVersion {
    const normalizedDate = new Date(date);
    const year = normalizedDate.getFullYear();
    const month = normalizedDate.getMonth() + 1;
    const day = normalizedDate.getDate();
    const hour = normalizedDate.getHours();
    const minute = normalizedDate.getMinutes();
    return new ModelVersion(`v${year}${month}${day}${hour}${minute}`);
  }

  toString(): string {
    return this._value;
  }
}
