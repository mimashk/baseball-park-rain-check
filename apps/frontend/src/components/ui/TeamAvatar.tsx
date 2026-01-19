import { Team } from "@/types/top";

type BlockProps = { team: Team; align: "left" | "right" };
type RowProps = { team: Team };

export function TeamBlock({ team, align }: BlockProps) {
  return (
    <div
      className={`flex items-center gap-2 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <img
        src={team.logoUrl}
        alt={team.name}
        className="h-10 w-10 rounded-full border border-[color:var(--border)] bg-white object-contain"
      />
      <div
        className={`flex flex-col ${
          align === "right" ? "items-end" : "items-start"
        }`}
      >
        <span className="text-sm text-muted">
          {align === "left" ? "Home" : "Away"}
        </span>
        <span className="text-base font-semibold text-strong">{team.name}</span>
      </div>
    </div>
  );
}

export function TeamRow({ team }: RowProps) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={team.logoUrl}
        alt={team.name}
        className="h-8 w-8 rounded-full border border-[color:var(--border)] bg-white object-contain"
      />
      <span className="text-sm font-semibold text-strong">{team.name}</span>
    </div>
  );
}
