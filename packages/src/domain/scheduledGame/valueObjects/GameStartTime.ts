const gameStartTimePattern = /^(?:[01]?\d|2[0-3]):[0-5]\d$/;
export class GameStartTime {
  private constructor(readonly value: string) {}

  static from(rawValue: string): GameStartTime {
    this.validate(rawValue);
    return new GameStartTime(rawValue);
  }

  private static validate(rawValue: string): void {
    if (!gameStartTimePattern.test(rawValue)) {
      throw new Error("開始時刻は0–23時のHH:00形式で指定してください");
    }
  }

  toString(): string {
    return this.value;
  }
  getParts(): { hour: number; minute: number } {
    const [hour, minute] = this.value.split(":").map(Number);
    return { hour, minute };
  }

  getHour(): number {
    return this.getParts().hour;
  }

  getMinute(): number {
    return this.getParts().minute;
  }
}
