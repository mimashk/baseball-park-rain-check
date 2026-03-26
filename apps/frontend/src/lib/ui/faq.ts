import type { FaqItem } from "@/components/ui/FaqSection";

export const COMMON_FAQ_ITEMS: FaqItem[] = [
  {
    id: "cancel-prob-meaning",
    question: "中止確率は何を表していますか",
    answer: [
      "中止確率は、試合開始時点で雨天中止になる可能性を予測した値です。最終判断は主催者発表をご確認ください。",
    ],
  },
  {
    id: "update-time",
    question: "予測はいつ更新されますか",
    answer:
      "天気データの更新に合わせて定期的に再計算されます。画面上部の「最終更新」時刻をご確認ください。",
  },
  {
    id: "dome-stadium",
    question: "ドーム球場はどう扱っていますか",
    answer:
      "屋根のある球場は雨の影響が小さいため、中止予測は行なっておりません。",
  },
  {
    id: "local-ballpark",
    question: "地方球場はどう扱っていますか",
    answer:
      "地方球場は開催試合数が少なく、過去の雨天中止傾向のデータ収集が困難であるため、予測は行なっておりません。",
  },
  {
    id: "prediction-gap",
    question: "予測と実際が違うことはありますか",
    answer:
      "あります。天候の急変、グラウンド状況、運営判断など、予測では完全に織り込めない要因があるためです。",
  },
  {
    id: "ballpark-difference",
    question: "球場ごとの差は反映されていますか",
    answer:
      "はい。球場やチームごとの過去傾向をもとに、予測値に反映しています。",
  },
  {
    id: "watch-decision",
    question: "この確率だけで観戦判断して大丈夫ですか",
    answer:
      "参考情報としてご利用ください。移動前には公式発表・交通情報・球団情報もあわせて確認することをおすすめします。",
  },
];

export const TOP_FAQ_ITEMS: FaqItem[] = COMMON_FAQ_ITEMS;

export const TEAM_FAQ_ITEMS: FaqItem[] = COMMON_FAQ_ITEMS;
