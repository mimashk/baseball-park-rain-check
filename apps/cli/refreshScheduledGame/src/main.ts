import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const container = createInfraContainer();

// [TODO] 修正する
const from =
  process.env.FIXED_FROM_DATE != null
    ? new Date(process.env.FIXED_FROM_DATE) // 例: FIXED_FROM_DATE=2025-06-01T00:00:00+09:00
    : new Date();
const to = new Date(from);
to.setMonth(to.getMonth() + 10);
async function main() {
  const scope = container.createScope();

  try {
    const usecase = scope.resolve("refreshScheduledGameUsecase");
    await usecase.execute({ from, to });
  } finally {
    const prisma = scope.resolve("prisma");
    await prisma.$disconnect();
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
