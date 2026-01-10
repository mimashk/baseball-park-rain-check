import { AppError } from "./AppError";

export class DomainError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("domain_invariant", message, { details });
  }
}
