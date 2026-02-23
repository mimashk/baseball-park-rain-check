import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const container = createInfraContainer();

const timeWindowBeforeHours = 3;
const timeWindowAfterHours = 3;
const forecastDays = 3;
const todayDate = new Date();
async function main() {
  const scope = container.createScope();

  try {
    const usecase = scope.resolve("predictCancellationUseCase");
    await usecase.execute({
      timeWindowBeforeHours,
      timeWindowAfterHours,
      forecastDays,
      todayDate,
    });
  } finally {
    if (process.env.STORAGE_BACKEND === "prisma") {
      const prisma = scope.resolve("prisma");
      await prisma.$disconnect();
    }
  }
}

main().catch((err) => {
  if (
    err instanceof DomainError ||
    err instanceof ValidationError ||
    err instanceof NotFoundError ||
    err instanceof AppError
  ) {
    console.error(`[${err.code}] ${err.message}`, err.details ?? "");
  } else {
    console.error("予期しないエラーが発生しました", err);
  }
  process.exit(1);
});
