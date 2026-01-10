import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("validation", message, { details });
  }
}
