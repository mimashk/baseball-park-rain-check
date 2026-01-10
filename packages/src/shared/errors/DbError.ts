import { InfrastructureError } from "./InfrastructureError";

export class DbError extends InfrastructureError {
  constructor(
    message = "DB操作でエラーが発生しました",
    options?: { cause?: unknown; details?: Record<string, unknown> }
  ) {
    super("db", message, {
      ...options,
      details: { layer: "db", ...options?.details },
    });
  }
}
