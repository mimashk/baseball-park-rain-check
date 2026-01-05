export const GameStatusType = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type GameStatusType =
  (typeof GameStatusType)[keyof typeof GameStatusType];

const allowedTransitionsFrom = {
  toInProgress: [GameStatusType.SCHEDULED],
  toCompleted: [GameStatusType.IN_PROGRESS],
  toCancelled: [GameStatusType.SCHEDULED, GameStatusType.IN_PROGRESS],
} as const;

export class GameStatus {
  private constructor(readonly value: GameStatusType) {}

  static scheduled() {
    return new GameStatus(GameStatusType.SCHEDULED);
  }
  toInProgress() {
    this.ensureAllowedTransitionFrom(
      allowedTransitionsFrom.toInProgress,
      GameStatusType.IN_PROGRESS
    );
    return new GameStatus(GameStatusType.IN_PROGRESS);
  }
  toCompleted() {
    this.ensureAllowedTransitionFrom(
      allowedTransitionsFrom.toCompleted,
      GameStatusType.COMPLETED
    );
    return new GameStatus(GameStatusType.COMPLETED);
  }
  toCancelled() {
    this.ensureAllowedTransitionFrom(
      allowedTransitionsFrom.toCancelled,
      GameStatusType.CANCELLED
    );
    return new GameStatus(GameStatusType.CANCELLED);
  }
  private ensureAllowedTransitionFrom(
    allowedFrom: readonly GameStatusType[],
    target: GameStatusType
  ) {
    if (!allowedFrom.includes(this.value)) {
      throw new Error(
        `${this.value} から ${target} への遷移は許可されていません`
      );
    }
  }
}
