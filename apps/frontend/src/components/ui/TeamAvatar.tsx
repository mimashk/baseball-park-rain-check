import Image from "next/image";
import { Team } from "@/types/Team";
import { TEAM_LOGO } from "@/lib/ui/team";

type BlockProps = { team: Team; align: "left" | "right" };
type RowProps = { team: Team };

export function TeamBlock({ team, align }: BlockProps) {
  const logoUrl = TEAM_LOGO[team.teamId];
  if (!logoUrl) {
    return null;
  }
  return (
    <div
      className={`flex items-center gap-2 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <Image
        src={logoUrl}
        alt={team.name}
        width={96}
        height={96}
        sizes="(max-width: 768px) 40px, (max-width: 1024px) 72px, 96px"
        className="h-10 w-10 md:h-18 md:w-18 lg:h-24 lg:w-24 bg-white object-contain"
      />
      <div
        className={`flex flex-col ${
          align === "right" ? "items-end" : "items-start"
        }`}
      >
        <span className="text-sm sm:text-base md:text-2xl font-semibold text-strong leading-snug break-words">
          {team.name}
        </span>
      </div>
    </div>
  );
}

export function TeamRow({ team }: RowProps) {
  const logoUrl = TEAM_LOGO[team.teamId];
  if (!logoUrl) {
    return null;
  }
  return (
    <div className="flex items-center gap-2">
      <Image
        src={logoUrl}
        alt={team.name}
        width={32}
        height={32}
        sizes="32px"
        className="h-8 w-8 rounded-full border border-[color:var(--border)] bg-white object-contain"
      />
      <span className="text-sm sm:text-base font-semibold text-strong leading-snug break-words">
        {team.name}
      </span>
    </div>
  );
}
