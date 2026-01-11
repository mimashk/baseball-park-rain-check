import { DomainError } from "packages/src/shared/errors/DomainError";
import { createInfraContainer } from "../../../packages/src/infra/di/container";
import { ValidationError } from "packages/src/shared/errors/ValidationError";
import { NotFoundError } from "packages/src/shared/errors/NotFoundError";
import { AppError } from "packages/src/shared/errors/AppError";

const container = createInfraContainer();
// 一旦甲子園のみ
const ballParkId = 1;
// 一旦3日分の予報を取得
const forecastDays = 3;

async function main() {
  const scope = container.createScope();

  const usecase = scope.resolve("refreshDailyWeatherForecastsUsecase");
  await usecase.execute({ ballParkId, forecastDays });
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
