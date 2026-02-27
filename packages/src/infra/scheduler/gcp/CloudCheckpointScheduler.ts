// infra/gcp/CloudSchedulerCheckpointAdapter.ts
import { google } from "googleapis";
import { CheckpointScheduler } from "../../../application/scheduledGame/interfaces/CheckpointScheduler";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";

/**
 * Cloud Scheduler は cron なので、1回きり相当を
 * 「実行したら次回を upsert / 終了なら delete」で実現する想定。
 */

export type CloudSchedulerConfig = {
  projectId: string;
  location: string;
  timeZone: string;
  baseUrl: string;
  invokerServiceAccountEmail: string;
  scopes: string[];
};

export class CloudSchedulerCheckpointAdapter implements CheckpointScheduler {
  constructor(private readonly config: CloudSchedulerConfig) {}

  async upsertCheckpoint(input: {
    jobKey: string;
    runAt: Date;
    endpointPath: string;
    query: Record<string, string>;
  }): Promise<void> {
    const auth = await this.getAuth();

    const scheduler = google.cloudscheduler({ version: "v1", auth });

    const parent = `projects/${this.config.projectId}/locations/${this.config.location}`;
    const name = `${parent}/jobs/${input.jobKey}`;

    const schedule = this.toCronInTokyo(input.runAt);
    const uri = this.buildUrl(input.endpointPath, input.query);

    // patch (存在しない場合は create へフォールバック) = upsert
    try {
      await scheduler.projects.locations.jobs.patch({
        name,
        updateMask: "schedule,timeZone,httpTarget",
        requestBody: {
          name,
          schedule,
          timeZone: this.config.timeZone,
          httpTarget: {
            uri,
            httpMethod: "POST",
            oidcToken: {
              serviceAccountEmail: this.config.invokerServiceAccountEmail,
            },
            headers: { "Content-Type": "application/json" },
          },
        },
      });
    } catch (err: unknown) {
      // NotFound などの場合は create
      try {
        await scheduler.projects.locations.jobs.create({
          parent,
          requestBody: {
            name,
            schedule,
            timeZone: this.config.timeZone,
            httpTarget: {
              uri,
              httpMethod: "POST",
              oidcToken: {
                serviceAccountEmail: this.config.invokerServiceAccountEmail,
              },
              headers: { "Content-Type": "application/json" },
            },
          },
        });
      } catch (err: unknown) {
        throw new ExternalServiceError("チェックポイントの作成に失敗しました", {
          cause: err,
          details: { name, uri, schedule },
        });
      }
    }
  }

  async deleteCheckpoint(jobKey: string): Promise<void> {
    const auth = await this.getAuth();
    const scheduler = google.cloudscheduler({ version: "v1", auth });

    const name = `projects/${this.config.projectId}/locations/${this.config.location}/jobs/${jobKey}`;
    try {
      await scheduler.projects.locations.jobs.delete({
        name,
      });
    } catch (e: unknown) {
      throw new ExternalServiceError("チェックポイントの削除に失敗しました", {
        cause: e,
        details: { name },
      });
    }
  }

  private buildUrl(path: string, query: Record<string, string>): string {
    const q = new URLSearchParams(query).toString();
    return `${this.config.baseUrl}${path}?${q}`;
  }

  private toCronInTokyo(runAt: Date): string {
    const parts = this.jstFormatter.formatToParts(runAt);
    const min = parts.find((p) => p.type === "minute")?.value;
    const hour = parts.find((p) => p.type === "hour")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    if (!min || !hour || !day || !month) {
      throw new ExternalServiceError("JST cron 変換に失敗しました");
    }
    return `${Number(min)} ${Number(hour)} ${Number(day)} ${Number(month)} *`;
  }

  private async getAuth() {
    try {
      return await google.auth.getClient({ scopes: this.config.scopes });
    } catch (err) {
      throw new ExternalServiceError("Cloud Scheduler 認証に失敗しました", {
        cause: err,
        details: {
          scopes: this.config.scopes,
          projectId: this.config.projectId,
        },
      });
    }
  }

  private readonly jstFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
