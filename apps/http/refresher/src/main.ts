import express from "express";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";

const app = express();
app.use(express.json());

const container = createInfraContainer();

const jstDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function jstYmd(date: Date) {
  const parts = jstDateFormatter.formatToParts(date);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  return { y, m, d };
}

function jstDateToUtcDate(y: number, m: number, d: number, hh = 0, mm = 0) {
  return new Date(Date.UTC(y, m - 1, d, hh - 9, mm, 0, 0));
}

app.post("/cron/schedule-initial-checkpoints", async (req, res, next) => {
  const scope = container.createScope();
  try {
    const usecase = scope.resolve("scheduleInitialGameCheckpointUseCase");
    const result = await usecase.execute({ now: new Date() });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post("/cron/run-game-checkpoint", async (req, res, next) => {
  const jobKeyParam = (req.query as any)?.jobKey || (req.body as any)?.jobKey;
  if (!jobKeyParam) {
    return next(
      new ValidationError("jobKey が指定されていません", {
        jobKey: jobKeyParam,
      })
    );
  }

  const scope = container.createScope();
  try {
    const usecase = scope.resolve("runGameCheckpointUseCase");
    const result = await usecase.execute({
      jobKey: jobKeyParam,
      now: new Date(),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post(
  "/cron/refresh-weather-forecast-and-scheduled-game",
  async (req, res, next) => {
    const now = new Date();
    const { y, m, d } = jstYmd(now);
    const from = jstDateToUtcDate(y, m, d + 1, 0, 0);
    const to = jstDateToUtcDate(y, m, d + 8, 23, 59);
    const scope = container.createScope();
    try {
      const usecase = scope.resolve(
        "refreshScheduledGameAndDailyWeatherForecastUsecase"
      );
      const result = await usecase.execute({
        from,
        to,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

app.post("/cron/update-prediction", async (req, res, next) => {
  const scope = container.createScope();
  const timeWindowBeforeHours = 3;
  const timeWindowAfterHours = 3;
  const forecastDays = 3;
  const todayDate = new Date();
  try {
    const usecase = scope.resolve("predictCancellationUseCase");
    const result = await usecase.execute({
      timeWindowBeforeHours,
      timeWindowAfterHours,
      forecastDays,
      todayDate,
    });
    res.json(result);
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
      console.warn(
        "リフレッシャーAPIでエラーが発生しました",
        err.code,
        err.message,
        err.details ?? ""
      );
      return res
        .status(400)
        .json({ code: err.code, message: err.message, details: err.details });
    }
    console.error("リフレッシャーAPIで予期せぬエラーが発生しました", err);
    return res
      .status(500)
      .json({ message: "リフレッシャーAPIで予期せぬエラーが発生しました" });
  }
);

const port = process.env.PORT ?? 8081;
app.listen(port, () => {
  console.log(`refresher listening on port ${port}`);
});
