import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const container = createInfraContainer();
const from = new Date();
const to = new Date(from);
to.setDate(to.getDate() + 10);

async function main() {
  const scope = container.createScope();
  try {
    const usecase = scope.resolve(
      "refreshScheduledGameAndDailyWeatherForecastUsecase"
    );
    await usecase.execute({ from, to });
    console.log(
      "Successfully refreshed scheduled game and daily weather forecast"
    );
  } catch (err) {
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
  }
}

main();
