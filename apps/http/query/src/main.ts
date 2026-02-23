import express from "express";
import { createInfraContainer } from "../../../../packages/src/infra/di/container";
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
  } finally {
    await scope.resolve("prisma").$disconnect();
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
  } finally {
    await scope.resolve("prisma").$disconnect();
  }
});
