import { v7 as uuidv7 } from "uuid";
import { ensureTextPresent } from "../../shared/utils/ensurePresent";

export class GameId {
  private constructor(readonly value: string) {}

  static generate(): GameId {
    return new GameId(uuidv7());
  }

  static fromString(value: string): GameId {
    const id = ensureTextPresent("試合ID", value);
    return new GameId(id);
  }

  toString(): string {
    return this.value;
  }
}
