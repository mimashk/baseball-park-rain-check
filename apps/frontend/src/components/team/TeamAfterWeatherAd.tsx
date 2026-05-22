import { ShinobiAdFrame } from "@/components/ads/ShinobiAdFrame";

const TEAM_AFTER_WEATHER_TAG_SRC =
  "https://adm.shinobi.jp/o/807fdcaf36126ba2d5ab4c06c46e2df9";

export function TeamAfterWeatherAd() {
  return (
    <section aria-label="広告" className="space-y-2">
      <p className="text-xs text-slate-500">広告</p>
      <div className="flex justify-center overflow-hidden">
        <ShinobiAdFrame
          tagSrc={TEAM_AFTER_WEATHER_TAG_SRC}
          title="team after weather ad"
        />
      </div>
    </section>
  );
}
