import {
  BatchJobName,
  BatchStatusWriter,
} from "../interfaces/BatchStatusWriter";

/**
 * バッチの完了時刻を記録する。
 *
 * この時刻はダッシュボードの「最終更新」表示に使うメタ情報であり、
 * 記録に失敗してもバッチ本体の処理結果は有効なので、警告ログだけ出して
 * 例外は伝播させない。ここで throw するとバッチ本体が成功しているのに
 * 呼び出し元が失敗扱いにしてリトライしてしまう。
 */
export async function recordBatchSuccess(
  writer: BatchStatusWriter,
  job: BatchJobName,
  completedAt?: Date
): Promise<void> {
  try {
    await writer.markSuccess(job, completedAt);
  } catch (err: unknown) {
    console.warn(`バッチ完了時刻の記録に失敗しました job=${job}`, err);
  }
}
