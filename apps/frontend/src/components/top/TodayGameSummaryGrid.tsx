import { TodayGame } from "@/types/TodayGame";
import { TodaySummary } from "@/components/team/TodaySummary";

type Props = { dateJst: string; games: TodayGame[] };

export function TodayGameSummaryGrid({ dateJst, games }: Props) {
  if (!games.length) {
    return <p className="text-muted">本日の試合はありません</p>;
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
