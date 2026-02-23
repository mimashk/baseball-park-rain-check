export type AppErrorCode =
  | "validation"
  | "domain_invariant"
  | "not_found"
  | "conflict"
  | "unauthorized"
  | "forbidden"
  | "db"
  | "external_service"
  | "mapping"
  | "object_storage"
  | "internal";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: Record<string, unknown>;
  constructor(
    code: AppErrorCode,
    message: string,
    options?: { cause?: unknown; details?: Record<string, unknown> }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = options?.details;
    if (options?.cause) (this as any).cause = options.cause;
  }
}
