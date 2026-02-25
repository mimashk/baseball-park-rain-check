import express from "express";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
import { DomainError } from "../../../../packages/src/shared/errors/DomainError";
import { ValidationError } from "../../../../packages/src/shared/errors/ValidationError";
import { NotFoundError } from "../../../../packages/src/shared/errors/NotFoundError";
import { AppError } from "../../../../packages/src/shared/errors/AppError";
// 既存同様のエラーハンドラ用 Error import

const app = express();
app.use(express.json());

const container = createInfraContainer();

app.get("/dashboards/top", async (req, res, next) => {
  const scope = container.createScope();
  try {
    const query = scope.resolve("getTopDashboardQuery");
    const date =
      typeof req.query.date === "string" ? req.query.date : undefined;
    const data = await query.execute({ dateJst: date });

    res.set("Cache-Control", "max-age=1800, stale-while-revalidate=300");
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.get("/dashboards/teams/:teamId", async (req, res, next) => {
  const scope = container.createScope();
  try {
    const query = scope.resolve("getTeamDashboardQuery");
    const teamId = req.params.teamId;
    const date =
      typeof req.query.date === "string" ? req.query.date : undefined;
    const data = await query.execute({ teamId, dateJst: date });

    res.set("Cache-Control", "max-age=1800, stale-while-revalidate=300");
    res.json(data);
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
    console.error("クエリAPIで予期せぬエラーが発生しました", err);
    return res
      .status(500)
      .json({ message: "クエリAPIで予期せぬエラーが発生しました" });
  }
);

const port = process.env.PORT ?? 8081;
app.listen(port, () => {
  console.log(`query listening on port ${port}`);
});
