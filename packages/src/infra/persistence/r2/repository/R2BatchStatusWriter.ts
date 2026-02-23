import {
  BatchJobName,
  BatchStatusWriter,
} from "../../../../application/shared/interfaces/BatchStatusWriter";
import { R2ObjectStore } from "../R2ObjectStore";
import { batchStatusKey } from "../utils/keyBuilders";

type BatchStatusDoc = {
  job: BatchJobName;
  status: "success" | "failed" | "running";
  completedAtUtc: string;
};

export class R2BatchStatusWriter implements BatchStatusWriter {
  constructor(private readonly store: R2ObjectStore) {}

  async markSuccess(
    job: BatchJobName,
    completedAt: Date = new Date()
  ): Promise<void> {
    const doc: BatchStatusDoc = {
      job,
      status: "success",
      completedAtUtc: completedAt.toISOString(),
    };
    await this.store.putJson(batchStatusKey(job), doc);
  }
}
