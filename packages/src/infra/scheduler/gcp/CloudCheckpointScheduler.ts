// infra/gcp/CloudSchedulerCheckpointAdapter.ts
import { google } from "googleapis";
import { CheckpointScheduler } from "../../../application/scheduledGame/interfaces/CheckpointScheduler";
import { ExternalServiceError } from "../../../shared/errors/ExternalServiceError";

/**
 * Cloud Scheduler は cron なので、1回きり相当を
 * 「実行したら次回を upsert / 終了なら delete」で実現する想定。
 */
export class CloudSchedulerCheckpointAdapter implements CheckpointScheduler {
  constructor(
    private readonly config: {
      projectId: "baseball-park-rain-check"; // 仮実装
      location: "asia-northeast1"; // e.g. "asia-northeast1"
      timeZone: "Asia/Tokyo"; // "Asia/Tokyo"
      baseUrl: "https://asia-northeast1-baseball-park-rain-check.run.app"; // 仮実装
      invokerServiceAccountEmail: "scheduler-invoker@baseball-park-rain-check.iam.gserviceaccount.com"; // 仮実装
      scopes: ["https://www.googleapis.com/auth/cloud-platform"];
    }
  ) {}

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
    // Cloud Scheduler の schedule は cron。
    // timeZone="Asia/Tokyo" を指定するので、runAt は Tokyo time の Date を想定。
    // ※より厳密にやるなら timezone-aware の変換を入れてください（Luxon 等）
    const min = runAt.getMinutes();
    const hour = runAt.getHours();
    const day = runAt.getDate();
    const month = runAt.getMonth() + 1;
    return `${min} ${hour} ${day} ${month} *`;
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
}
