import { inspect } from "node:util";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const container = createInfraContainer();

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

// JSTのその日の 23:59:59 を UTC の Date で返す
function jstDayEndUtc(dateStr: string): Date {
  const d = new Date(`${dateStr}T23:59:59+09:00`);
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

function resolveRange(args: Map<string, string>): { from: Date; to: Date } {
  const date = args.get("date");
  if (date) {
    return { from: jstDayStartUtc(date), to: jstDayEndUtc(date) };
  }

  const fromArg = args.get("from");
  const toArg = args.get("to");
  if (fromArg || toArg) {
    if (!fromArg || !toArg) {
      throw new ValidationError("--from と --to は両方指定してください");
    }
    return { from: jstDayStartUtc(fromArg), to: jstDayEndUtc(toArg) };
  }

  // 無指定: 従来どおり 今日〜10日後
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + 10);
  return { from, to };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { from, to } = resolveRange(args);

  const scope = container.createScope();
  try {
    const usecase = scope.resolve(
      "refreshScheduledGameAndDailyWeatherForecastUsecase",
    );
    const result = await usecase.execute({ from, to });
    console.log(
      "Successfully refreshed scheduled game and daily weather forecast",
      inspect(result, { depth: null }),
    );
  } catch (err) {
    if (
      err instanceof DomainError ||
      err instanceof ValidationError ||
      err instanceof NotFoundError ||
      err instanceof AppError
    ) {
      console.error(`[${err.code}] ${err.message}`);
      console.error("details:", inspect(err.details ?? "", { depth: null }));
      // 原因チェーン全体（最深部のR2エラーまで）を出す
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
