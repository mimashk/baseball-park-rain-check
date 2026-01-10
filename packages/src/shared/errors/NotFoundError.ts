import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("not_found", message, { details });
  }
}
