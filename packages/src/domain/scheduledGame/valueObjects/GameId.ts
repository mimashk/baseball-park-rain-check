import { v7 as uuidv7 } from "uuid";

export class GameId {
  private constructor(readonly value: string) {}

  static generate(): GameId {
    return new GameId(uuidv7());
  }

  static fromString(value: string): GameId {
    if (!value || typeof value !== "string") {
      throw new Error("不正な試合IDです");
    }
    return new GameId(value);
  }

  toString(): string {
    return this.value;
  }
}
