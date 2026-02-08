// apps/frontend/src/components/ui/teamTheme.ts
import { TeamId } from "@/types/TeamId";

export type TeamTheme = {
  border: string;
  primary: string;
};

export const TEAM_THEMES: Record<TeamId, TeamTheme> = {
  HT: { border: "#FEE200", primary: "#FEE200" },
  YG: { border: "#EB9713", primary: "#EB9713" },
  YS: { border: "#02A051", primary: "#02A051" },
  C: { border: "#EE161F", primary: "#EE161F" },
  D: { border: "#1eb2e9", primary: "#1eb2e9" },
  DB: { border: "#003F8E", primary: "#003F8E" },
  F: { border: "#01609A", primary: "#01609A" },
  M: { border: "#000000", primary: "#000000" },
  B: { border: "#A58113", primary: "#A58113" },
  L: { border: "#051E46", primary: "#051E46" },
  H: { border: "#FCC700", primary: "#FCC700" },
  E: { border: "#870010", primary: "#870010" },
};
