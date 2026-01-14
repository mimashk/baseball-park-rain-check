import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const container = createInfraContainer();

const ballParkId = 2;
const to = new Date();
// [TODO] 2025年のデータがまだないのでこの対応
to.setMonth(to.getMonth() - 14); // 今日から1か月前
const from = new Date(to);
from.setFullYear(from.getFullYear() - 10); // to から5年前
const timeWindowBeforeHours = 3;
const timeWindowAfterHours = 3;

async function main() {
  const scope = container.createScope();
  try {
    const usecase = scope.resolve("runTrainingPipelineUseCase");
    await usecase.execute({
      ballParkId,
      from,
      to,
      timeWindowBeforeHours,
      timeWindowAfterHours,
    });
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
