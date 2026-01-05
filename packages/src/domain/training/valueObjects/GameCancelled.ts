export type GameCancelledType = "CANCELLED" | "PLAYED";

export class GameCancelled {
  private constructor(readonly value: GameCancelledType) {}

  static cancelled(): GameCancelled {
    return new GameCancelled("CANCELLED");
  }

  static played(): GameCancelled {
    return new GameCancelled("PLAYED");
  }

  static fromBoolean(isCancelled: boolean): GameCancelled {
    return isCancelled ? GameCancelled.cancelled() : GameCancelled.played();
  }

  toNumber(): 0 | 1 {
    return this.value === "CANCELLED" ? 1 : 0;
  }
}
