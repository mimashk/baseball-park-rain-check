import { ShinobiAdFrame } from "@/components/ads/ShinobiAdFrame";

const TOP_AFTER_GAMES_TAG_SRC =
  "https://adm.shinobi.jp/o/2ca89e7acf1e54db901bb13db4a31b1d";

export function TopAfterGamesAd() {
  return (
    <section aria-label="広告" className="space-y-2">
      <p className="text-xs text-slate-500">広告</p>
      <div className="flex justify-center overflow-hidden">
        <ShinobiAdFrame
          tagSrc={TOP_AFTER_GAMES_TAG_SRC}
          title="top after games ad"
        />
      </div>
    </section>
  );
}
