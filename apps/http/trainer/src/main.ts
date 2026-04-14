import express from "express";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { BallParkId } from "../../../../packages/src/domain/scheduledGame/valueObjects/BallPark";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const app = express();
app.use(express.json());

const container = createInfraContainer();

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

function parseDateQuery(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function parseIntegerQuery(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return undefined;
  return parsed;
}

app.post("/cron/run-training-pipeline", async (req, res, next) => {
  const scope = container.createScope();
  const defaults = buildDefaultTrainingWindow();
  const ballParkId = 2;
  try {
    const usecase = scope.resolve("runTrainingPipelineUseCase");
    const result = await usecase.execute({
      ballParkId,
      from: defaults.from,
      to: defaults.to,
      timeWindowBeforeHours: defaults.timeWindowBeforeHours,
      timeWindowAfterHours: defaults.timeWindowAfterHours,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get("/training/export.csv", async (req, res, next) => {
  const scope = container.createScope();
  const defaults = buildDefaultTrainingWindow();
  const parsedFrom = parseDateQuery(req.query.from);
  const parsedTo = parseDateQuery(req.query.to);
  const parsedBeforeHours = parseIntegerQuery(req.query.beforeHours);
  const parsedAfterHours = parseIntegerQuery(req.query.afterHours);
  const ballParkIdParam = parseIntegerQuery(req.query.ballParkId);

  if (typeof req.query.from === "string" && !parsedFrom) {
    return next(new ValidationError("from は ISO 日付形式で指定してください"));
  }
  if (typeof req.query.to === "string" && !parsedTo) {
    return next(new ValidationError("to は ISO 日付形式で指定してください"));
  }
  if (
    typeof req.query.beforeHours === "string" &&
    parsedBeforeHours === undefined
  ) {
    return next(new ValidationError("beforeHours は整数で指定してください"));
  }
  if (
    typeof req.query.afterHours === "string" &&
    parsedAfterHours === undefined
  ) {
    return next(new ValidationError("afterHours は整数で指定してください"));
  }
  if (
    typeof req.query.ballParkId === "string" &&
    ballParkIdParam === undefined
  ) {
    return next(new ValidationError("ballParkId は整数で指定してください"));
  }

  const from = parsedFrom ?? defaults.from;
  const to = parsedTo ?? defaults.to;
  const timeWindowBeforeHours =
    parsedBeforeHours ?? defaults.timeWindowBeforeHours;
  const timeWindowAfterHours =
    parsedAfterHours ?? defaults.timeWindowAfterHours;

  if (ballParkIdParam !== undefined && ballParkIdParam <= 0) {
    return next(
      new ValidationError("ballParkId は正の整数で指定してください", {
        ballParkId: ballParkIdParam,
      })
    );
  }
  if (timeWindowBeforeHours < 0 || timeWindowAfterHours < 0) {
    return next(
      new ValidationError("beforeHours / afterHours は 0 以上で指定してください", {
        timeWindowBeforeHours,
        timeWindowAfterHours,
      })
    );
  }

  try {
    const usecase = scope.resolve("exportTrainingDatasetCsvUseCase");
    const csv = await usecase.execute({
      from,
      to,
      timeWindowBeforeHours,
      timeWindowAfterHours,
      ballParkId: ballParkIdParam as BallParkId | undefined,
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="training_dataset.csv"'
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (
      err instanceof DomainError ||
      err instanceof ValidationError ||
      err instanceof NotFoundError ||
      err instanceof AppError
    ) {
      return res
        .status(400)
        .json({ code: err.code, message: err.message, details: err.details });
    }
    console.error("トレーナーAPIで予期せぬエラーが発生しました", err);
    return res
      .status(500)
      .json({ message: "トレーナーAPIで予期せぬエラーが発生しました" });
  }
);

const port = process.env.PORT ?? 8081;
app.listen(port, () => {
  console.log(`trainer listening on port ${port}`);
});
