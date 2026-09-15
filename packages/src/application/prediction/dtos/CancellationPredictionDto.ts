/** 差し替え後の経路で何スロットを埋められたかの内訳 */
export type ShadowSourceBreakdownDto = {
  /** 気象庁アメダスの実況 */
  observation: number;
  /** 気象庁 降水短時間予報 */
  shortRangeForecast: number;
  /** 差し替えできず Open-Meteo のままだったもの */
  baseline: number;
};

/** 差し替えの前後で特徴量がどう動いたか */
export type ShadowFeaturesDto = {
  avgRainFall: number;
  rainOccurRate: number;
  baselineAvgRainFall: number;
  baselineRainOccurRate: number;
};

export type CancellationPredictionDto = {
  gameId: string;
  /** 表示に使う確率。切り替えまでは従来どおり Open-Meteo 由来の値が入る */
  probability: number;
  modelVersion: string;
  predictedAtUtc: string;

  // ---- 以下はシャドー運用のための追加。すべて任意で後方互換 ----
  // 読み出し側(ダッシュボードのクエリ)は参照しないため、追加しても表示は変わらない。
  // 切り替え(フェーズ5)では probability に shadowProbability を入れるだけで済む。

  /**
   * 差し替え後の経路で計算した確率。表示には使わない。
   * 差し替えが1スロットも起きなかった場合も、値が同じであること自体に意味があるので記録する。
   */
  shadowProbability?: number;

  /**
   * スロットごとの採用ソースの件数。
   * 「気象庁のタイルを使っているつもりで実は全部 Open-Meteo だった」を検出するために持つ。
   * スロット単位の詳細は PrecipitationResolutionDto 側に残すので、ここは件数だけ。
   */
  shadowSources?: ShadowSourceBreakdownDto;

  /**
   * 特徴量の新旧。確率だけだと「なぜ変わったか」を追えないため。
   * 較正(フェーズ4)で階級の代表値を決めるときにも使う。
   */
  shadowFeatures?: ShadowFeaturesDto;

  /**
   * 採用した予報の初期時刻のうち最も古いもの(ISO8601)。
   * 「何時時点の予報か」の表示(フェーズ5)にそのまま使える。
   * バッチ完了時刻とは別物で、こちらの方が体感の鮮度に近い。
   */
  oldestSourceTimeUtc?: string;
};
