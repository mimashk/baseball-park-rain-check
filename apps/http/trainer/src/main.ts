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

app.post("/cron/run-training-pipeline", async (req, res, next) => {
  const scope = container.createScope();
  const ballParkId = 2;
  const to = new Date();
  // [TODO] 2025年のデータがまだないのでこの対応
  to.setMonth(to.getMonth() - 14); // 今日から1か月前
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 10); // to から5年前
  const timeWindowBeforeHours = 3;
  const timeWindowAfterHours = 3;
  try {
    const usecase = scope.resolve("runTrainingPipelineUseCase");
    const result = await usecase.execute({
      ballParkId,
      from,
      to,
      timeWindowBeforeHours,
      timeWindowAfterHours,
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
  console.log(`trainer listening on port ${port}`);
});
