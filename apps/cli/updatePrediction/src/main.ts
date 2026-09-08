import { inspect } from "node:util";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const container = createInfraContainer();

const timeWindowBeforeHours = 3;
const timeWindowAfterHours = 3;
const forecastDays = 10;

// JSTのその日の 00:00 を UTC の Date で返す
function jstDayStartUtc(dateStr: string): Date {
  const d = new Date(`${dateStr}T00:00:00+09:00`);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError("日付は YYYY-MM-DD 形式で指定してください", {
      value: dateStr,
    });
  }
  return d;
}

function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new ValidationError(`--${key} に値を指定してください`);
    }
    args.set(key, value);
    i += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dateArg = args.get("date");
  const todayDate = dateArg ? jstDayStartUtc(dateArg) : new Date();

  const scope = container.createScope();
  try {
    const usecase = scope.resolve("predictCancellationUseCase");
    const result = await usecase.execute({
      timeWindowBeforeHours,
      timeWindowAfterHours,
      forecastDays,
      todayDate,
    });
    console.log("予測処理が完了しました", inspect(result, { depth: null }));
  } catch (err) {
    if (
      err instanceof DomainError ||
      err instanceof ValidationError ||
      err instanceof NotFoundError ||
      err instanceof AppError
    ) {
      console.error(`[${err.code}] ${err.message}`);
      console.error("details:", inspect(err.details ?? "", { depth: null }));
      console.error("cause chain:", inspect(err, { depth: null }));
    } else {
      console.error(
        "予期しないエラーが発生しました",
        inspect(err, { depth: null }),
      );
    }
    process.exit(1);
  }
}

main();
