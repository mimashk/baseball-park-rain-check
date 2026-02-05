import { TodayGame } from "@/types/TodayGame";

type StatusInfo = {
  label: string;
  style?: { background: string; color: string };
};

const STATUS_INFO: Record<TodayGame["status"], StatusInfo> = {
  SCHEDULED: { label: "試合開始前" },
  IN_PROGRESS: {
    label: "試合中",
    style: { background: "rgba(22, 163, 74, 0.16)", color: "var(--success)" },
  },
  COMPLETED: { label: "試合終了" },
  CANCELLED: {
    label: "試合中止",
    style: { background: "rgba(239, 68, 68, 0.16)", color: "var(--danger)" },
  },
};

export function getGameStatusInfo(
  status: TodayGame["status"] | null | undefined
): StatusInfo | null {
  if (!status) return null;
  return STATUS_INFO[status];
}
