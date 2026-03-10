import { TodayGame } from "@/types/TodayGame";
import { TodaySummary } from "@/components/team/TodaySummary";
import { fmtDate } from "@/lib/formatters/jst";

type Props = { dateJst: string; games: TodayGame[] };

export function TodayGameSummaryGrid({ dateJst, games }: Props) {
  if (!games.length) {
    return (
      <section
        className="rounded-2xl border border-[color:var(--border)] bg-white shadow-sm"
        aria-label="本日の試合はありません"
      >
        <div className="p-6 md:p-8">
          <p className="text-sm text-muted">
            {fmtDate(`${dateJst}T00:00:00Z`)}
          </p>

          <h2 className="mt-2 text-xl font-semibold text-strong">
            今日は試合がありません
          </h2>

          <p className="mt-3 text-sm text-muted">
            明日以降の試合情報と天気をチェックしましょう。
          </p>

          <div className="mt-5 inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-muted">
            TEAM SELECT から気になる球団へ
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-4">
      {games.map((game) => (
        <div key={game.gameId} className="rounded-2xl bg-white shadow-sm">
          <TodaySummary dateJst={dateJst} game={game} hourly={[]} />
        </div>
      ))}
    </div>
  );
}
