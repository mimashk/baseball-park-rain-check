import { InfrastructureError } from "./InfrastructureError";

export class ObjectStorageError extends InfrastructureError {
  constructor(
    message = "オブジェクトストレージ操作でエラーが発生しました",
    options?: { cause?: unknown; details?: Record<string, unknown> }
  ) {
    super("object_storage", message, {
      ...options,
      details: { layer: "object_storage", ...options?.details },
    });
  }
}
