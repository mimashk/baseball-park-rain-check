import { BatchStatusRepository } from "../../../../application/dashboard/interfaces/BatchStatusRepository";
import { R2ObjectStore } from "../R2ObjectStore";

type BatchStatusDoc = {
  job: string;
  status: "success" | "failed" | "running";
  completedAtUtc: string;
};

const DEFAULT_KEYS = [
  "meta/batch-status/refresher.json",
  "meta/batch-status/prediction.json",
  "meta/batch-status/trainer.json",
];

export class R2BatchStatusRepository implements BatchStatusRepository {
  constructor(
    private readonly store: R2ObjectStore,
    private readonly keys: string[] = DEFAULT_KEYS
  ) {}

  async findLatestCompletedAtUtc(): Promise<Date | null> {
    const docs = await Promise.all(
      this.keys.map((key) => this.store.getJson<BatchStatusDoc>(key))
    );

    const times = docs
      .flatMap((d) => (d?.completedAtUtc ? [new Date(d.completedAtUtc)] : []))
      .filter((d) => !Number.isNaN(d.getTime()));

    if (times.length === 0) return null;
    return new Date(Math.max(...times.map((d) => d.getTime())));
  }
}
