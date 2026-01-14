import express from "express";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";
import { BallParkId } from "@domain/scheduledGame/valueObjects/BallPark";

const app = express();
app.use(express.json());

const container = createInfraContainer();

app.post("/cron/schedule-initial-checkpoints", async (req, res, next) => {
  const scope = container.createScope();
  try {
    const usecase = scope.resolve("scheduleInitialGameCheckpointUseCase");
    const result = await usecase.execute({ now: new Date() });
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    await scope.resolve("prisma").$disconnect();
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
  } finally {
    await scope.resolve("prisma").$disconnect();
  }
});

app.post("/cron/refresh-daily-forecast", async (req, res, next) => {
  const ballParkIdParam =
    (req.query as any)?.ballParkId || (req.body as any)?.ballParkId;
  const ballParkId = ballParkIdParam ? Number(ballParkIdParam) : 2;
  if (Number.isNaN(ballParkId)) {
    return next(
      new ValidationError("不正な球場IDが指定されました", {
        ballParkId: ballParkIdParam,
      })
    );
  }

  const scope = container.createScope();
  try {
    const usecase = scope.resolve("refreshDailyWeatherForecastsUsecase");
    const result = await usecase.execute({
      ballParkId: ballParkId as BallParkId,
      forecastDays: 3,
    });
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    await scope.resolve("prisma").$disconnect();
  }
});

app.post("/cron/refresh-scheduled-games", async (req, res, next) => {
  const from = new Date();
  from.setDate(from.getDate() + 1);
  const to = new Date();
  to.setDate(to.getDate() + 8);
  const scope = container.createScope();
  try {
    const usecase = scope.resolve("refreshScheduledGameUsecase");
    const result = await usecase.execute({
      from,
      to,
    });
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    await scope.resolve("prisma").$disconnect();
  }
});

app.post("/cron/refresh-prediction", async (req, res, next) => {
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
  } finally {
    await scope.resolve("prisma").$disconnect();
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
    console.error("予期せぬエラーが発生しました", err);
    return res.status(500).json({ message: "予期せぬエラーが発生しました" });
  }
);

const port = process.env.PORT ?? 8081;
app.listen(port, () => {
  console.log(`refresher listening on port ${port}`);
});
