import { fmtUpdate } from "@/lib/formatters/jst";
import { SiteBranding } from "@/components/ui/SiteBranding";

type Props = {
  batchCompletedAtUtc: string;
  /** 右側に「最終更新」の下に表示する要素（例: シェアボタン） */
  rightSlot?: React.ReactNode;
};

export function SiteHeader({ batchCompletedAtUtc, rightSlot }: Props) {
  return (
    <header className="flex items-center justify-between">
      <SiteBranding />
      <div className="flex flex-col items-end gap-2">
        <p className="text-xs sm:text-sm text-muted">
          最終更新: {fmtUpdate(batchCompletedAtUtc)}
        </p>
        {rightSlot}
      </div>
    </header>
  );
}
