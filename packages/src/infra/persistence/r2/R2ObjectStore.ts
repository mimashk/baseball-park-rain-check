import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ObjectStorageError } from "../../../shared/errors/ObjectStorageError";

export type R2Config = {
  endpoint: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new ValidationError(`環境変数 ${name} が未設定です`);
  return value;
};

export const readR2ConfigFromEnv = (): R2Config => ({
  endpoint: required("R2_ENDPOINT"),
  bucketName: required("R2_BUCKET_NAME"),
  accessKeyId: required("R2_ACCESS_KEY_ID"),
  secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
});

export class R2ObjectStore {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: R2Config) {
    this.bucket = config.bucketName;
    this.client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async putJson(key: string, value: unknown): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: JSON.stringify(value),
          ContentType: "application/json",
        })
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("R2へのデータ保存に失敗しました", {
        cause: err,
      });
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      if (!res.Body) return null;
      const text = await res.Body.transformToString();
      return JSON.parse(text) as T;
    } catch (err: unknown) {
      throw new ObjectStorageError("R2からデータを取得できませんでした", {
        cause: err,
      });
    }
  }

  async listKeys(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    let token: string | undefined;

    while (true) {
      try {
        const res = await this.client.send(
          new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: prefix,
            ContinuationToken: token,
          })
        );

        for (const item of res.Contents ?? []) {
          if (item.Key) keys.push(item.Key);
        }

        if (!res.NextContinuationToken) break;

        token = res.NextContinuationToken;
      } catch (err: unknown) {
        throw new ObjectStorageError("R2からキーを取得できませんでした", {
          cause: err,
        });
      }
    }

    return keys;
  }

  async deleteKey(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch (err: unknown) {
      throw new ObjectStorageError("R2のデータ削除に失敗しました", {
        cause: err,
        details: { key },
      });
    }
  }

  async deleteKeys(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.deleteKey(key)));
    } catch (err: unknown) {
      throw new ObjectStorageError("R2の複数データ削除に失敗しました", {
        cause: err,
        details: { count: keys.length },
      });
    }
  }
}
