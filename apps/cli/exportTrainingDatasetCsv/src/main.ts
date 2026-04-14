import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { BallParkId } from "../../../../packages/src/domain/scheduledGame/valueObjects/BallPark";
import { AppError } from "../../../../packages/src/shared/errors/AppError";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";

const container = createInfraContainer();
const DEFAULT_OUTPUT_DIR = "tmp/training";

type CliOptions = {
  outDir: string;
  from: Date;
  to: Date;
  timeWindowBeforeHours: number;
  timeWindowAfterHours: number;
  ballParkId?: BallParkId;
};

function buildDefaultTrainingWindow() {
  const to = new Date();
  // [TODO] 2025年のデータがまだないのでこの対応
  to.setMonth(to.getMonth() - 14);
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 10);
  return {
    from,
    to,
    timeWindowBeforeHours: 3,
    timeWindowAfterHours: 3,
  };
}

function parseArgs(argv: string[]): CliOptions {
  const defaults = buildDefaultTrainingWindow();
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

  const outDir = path.resolve(
    process.cwd(),
    args.get("outDir") ?? args.get("out") ?? DEFAULT_OUTPUT_DIR
  );
  const from = parseDateArg(args.get("from"), "from") ?? defaults.from;
  const to = parseDateArg(args.get("to"), "to") ?? defaults.to;
  const timeWindowBeforeHours =
    parseIntegerArg(args.get("beforeHours"), "beforeHours") ??
    defaults.timeWindowBeforeHours;
  const timeWindowAfterHours =
    parseIntegerArg(args.get("afterHours"), "afterHours") ??
    defaults.timeWindowAfterHours;
  const ballParkId = parseBallParkIdArg(args.get("ballParkId"));

  if (timeWindowBeforeHours < 0 || timeWindowAfterHours < 0) {
    throw new ValidationError("beforeHours / afterHours は 0 以上で指定してください", {
      timeWindowBeforeHours,
      timeWindowAfterHours,
    });
  }

  return {
    outDir,
    from,
    to,
    timeWindowBeforeHours,
    timeWindowAfterHours,
    ballParkId,
  };
}

function parseDateArg(value: string | undefined, fieldName: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} は ISO 日付形式で指定してください`, {
      value,
    });
  }
  return parsed;
}

function parseIntegerArg(value: string | undefined, fieldName: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new ValidationError(`${fieldName} は整数で指定してください`, {
      value,
    });
  }
  return parsed;
}

function parseBallParkIdArg(value: string | undefined): BallParkId | undefined {
  if (!value) return undefined;
  const parsed = parseIntegerArg(value, "ballParkId");
  if (parsed === undefined) return undefined;
  if (parsed <= 0) {
    throw new ValidationError("ballParkId は正の整数で指定してください", {
      value,
    });
  }
  return parsed as BallParkId;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const scope = container.createScope();

  try {
    const exportTrainingSourceDataCsvUseCase = scope.resolve(
      "exportTrainingSourceDataCsvUseCase"
    );
    const exportTrainingDatasetCsvUseCase = scope.resolve(
      "exportTrainingDatasetCsvUseCase"
    );
    const request = {
      from: options.from,
      to: options.to,
      timeWindowBeforeHours: options.timeWindowBeforeHours,
      timeWindowAfterHours: options.timeWindowAfterHours,
      ballParkId: options.ballParkId,
    };
    const [sourceDataResult, trainingDatasetCsv] = await Promise.all([
      exportTrainingSourceDataCsvUseCase.execute(request),
      exportTrainingDatasetCsvUseCase.execute(request),
    ]);

    await mkdir(options.outDir, { recursive: true });
    const pastGamesPath = path.join(options.outDir, "past_games.csv");
    const observedHourlyWeatherPath = path.join(
      options.outDir,
      "observed_hourly_weather.csv"
    );
    const trainingDatasetPath = path.join(
      options.outDir,
      "training_dataset.csv"
    );
    await Promise.all([
      writeFile(pastGamesPath, sourceDataResult.pastGamesCsv, "utf8"),
      writeFile(
        observedHourlyWeatherPath,
        sourceDataResult.observedHourlyWeatherCsv,
        "utf8"
      ),
      writeFile(trainingDatasetPath, trainingDatasetCsv, "utf8"),
    ]);
    console.log(`CSV exported to ${options.outDir}`);
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
