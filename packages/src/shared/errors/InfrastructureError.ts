import { AppError, AppErrorCode } from "./AppError";

export class InfrastructureError extends AppError {
  constructor(
    code: AppErrorCode = "internal",
    message: string,
    options?: { cause?: unknown; details?: Record<string, unknown> }
  ) {
    super(code, message, options);
  }
}
