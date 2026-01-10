// infra/training/CancellationModelRepositoryImpl.ts
import { promises as fs } from "fs";
import path from "path";
import { CancellationModelRepository } from "../../../domain/model/repositoryInterface/CancellationModelRepository";
import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { ModelVersion } from "../../../domain/model/valueObjects/ModelVersion";

export class CancellationModelRepositoryImpl
  implements CancellationModelRepository
{
  constructor(private readonly baseDir: string) {}

  async save(model: CancellationModel): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const file = path.join(this.baseDir, `${model.version.toString()}.json`);
    await fs.writeFile(
      file,
      JSON.stringify({
        date: model.version.toDate().toISOString(),
        featureOrder: model.featureOrder,
        coefficients: model.coefficients,
        intercept: model.intercept,
        mean: model.mean,
        std: model.std,
      }),
      "utf8"
    );
  }

  async load(version: ModelVersion): Promise<CancellationModel | null> {
    const file = path.join(this.baseDir, `${version.toString()}.json`);
    try {
      const content = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(content);
      return CancellationModel.create({
        date: parsed.date ? new Date(parsed.date) : version.toDate(),
        featureOrder: parsed.featureOrder,
        coefficients: parsed.coefficients,
        intercept: parsed.intercept,
        mean: parsed.mean,
        std: parsed.std,
      });
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err && err.code === "ENOENT") {
        return null;
      }
      throw err;
    }
  }
}
