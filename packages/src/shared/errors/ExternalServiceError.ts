import { InfrastructureError } from "./InfrastructureError";

export class ExternalServiceError extends InfrastructureError {
  constructor(
    message = "外部サービス呼び出しに失敗しました",
    options?: { cause?: unknown; details?: Record<string, unknown> }
  ) {
    super("external_service", message, {
      ...options,
      details: { layer: "external", ...options?.details },
    });
  }
}
