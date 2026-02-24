import Link from "next/link";
import Image from "next/image";
import { TEAM_IDS, TEAM_META, TEAM_LOGO, TEAM_THEMES } from "@/lib/ui/team";

export function TeamHeaderNav() {
  return (
    <div className="pt-1">
      <div className="mb-2 h-px w-full bg-[color:var(--border)]" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">TEAM SELECT</span>
      </div>

      <div className="flex gap-2 overflow-x-auto overflow-y-visible py-2">
        {TEAM_IDS.map((id) => (
          <Link
            key={id}
            href={`/team/${id}`}
            aria-label={TEAM_META[id].shortName}
            className="flex h-12 w-12 shrink-0 aspect-square items-center justify-center rounded-full border bg-white shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:bg-slate-50"
            style={{ borderColor: TEAM_THEMES[id].border }}
          >
            <Image
              src={TEAM_LOGO[id]}
              alt={TEAM_META[id].shortName}
              width={32}
              height={32}
              sizes="32px"
              className="h-8 w-8 rounded-full object-contain bg-white"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
