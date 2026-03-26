export function TopIntroCard() {
  return (
    <section
      aria-label="サービス紹介"
      className="rounded-2xl border border-[color:var(--border)] bg-white/75 p-5 shadow-sm backdrop-blur-[1px] md:p-6"
    >
      <p className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-muted">
        ABOUT THIS SERVICE
      </p>

      <h2 className="mt-3 text-lg font-bold text-strong md:text-xl">
        プロ野球の雨天中止リスクを、ひと目でチェック
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted">
        過去の中止傾向と最新の天気データから、今日の試合の雨天中止確率を予測しています。
        <br className="hidden sm:block" />
        観戦・現地移動前の判断に使える、シンプルな天気ダッシュボードです。
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-muted">
          球場ごとの傾向を反映
        </span>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-muted">
          試合時間帯の天気も確認可能
        </span>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-muted">
          最終更新時刻を明記
        </span>
      </div>
    </section>
  );
}
