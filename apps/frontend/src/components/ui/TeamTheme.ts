export type TeamTheme = {
  key: string;
  primary: string;
  border: string;
};

export const TEAM_THEMES: Record<string, TeamTheme> = {
  hanshin: {
    key: "hanshin",
    primary: "#191210",
    border: "#F2CA08",
  },
  // 今後ここに追加
};
