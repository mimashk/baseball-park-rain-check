import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { AppError } from "packages/src/shared/errors/AppError";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";

const container = createInfraContainer();

async function main() {
  const scope = container.createScope();
  try {
    const usecase = scope.resolve("runGameCheckpointUseCase");
    await usecase.execute({
      jobKey: "checkpoint-2026-1-13-1234567890",
      now: new Date(),
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
