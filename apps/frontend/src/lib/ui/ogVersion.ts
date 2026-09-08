/**
 * X(Twitter) のカードキャッシュ対策用のバージョン値。
 *
 * X は「共有URL単位」でカード情報を、「og:image のURL単位」で画像バイナリを
 * それぞれキャッシュする。どちらも固定URLだと最初にクロールされた時点の
 * 日付・中止確率が焼き込まれた画像が出続けるため、共有URLとOG画像URLの両方に
 * 一定間隔で変化するバージョンを付けて別リソースとして再クロールさせる。
 *
 * 中止予測バッチは JST 7〜19時の毎時0分に走るので、更新を取りこぼさない粒度として
 * 10分バケットを採用する（バッチ完了が数分遅れても次のバケットで反映される）。
 * データ更新時刻(batchCompletedAtUtc)は現状バッチ側で記録されておらず
 * リクエスト時刻にフォールバックするため、バージョン値には使えない。
 */
const BUCKET_MS = 10 * 60 * 1000;

export function currentOgVersion(now: Date = new Date()): string {
  return String(Math.floor(now.getTime() / BUCKET_MS));
}
