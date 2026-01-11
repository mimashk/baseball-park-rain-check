export type WeatherCategory = "CLEAR" | "CLOUDY" | "RAIN" | "SNOW" | "THUNDER";

export const WeatherCodeCatalog: Record<
  number,
  {
    labelJa: string;
    category: WeatherCategory;
  }
> = {
  0: { labelJa: "晴れ", category: "CLEAR" },
  1: { labelJa: "主に晴れ", category: "CLEAR" },

  2: { labelJa: "一部曇り", category: "CLOUDY" },
  3: { labelJa: "曇り", category: "CLOUDY" },
  45: { labelJa: "霧", category: "CLOUDY" },
  48: { labelJa: "霧氷", category: "CLOUDY" },

  51: { labelJa: "軽い霧雨", category: "RAIN" },
  53: { labelJa: "霧雨", category: "RAIN" },
  55: { labelJa: "強い霧雨", category: "RAIN" },
  56: { labelJa: "軽い着氷霧雨", category: "RAIN" },
  57: { labelJa: "着氷霧雨", category: "RAIN" },

  61: { labelJa: "弱い雨", category: "RAIN" },
  63: { labelJa: "中程度の雨", category: "RAIN" },
  65: { labelJa: "強い雨", category: "RAIN" },
  66: { labelJa: "軽い着氷雨", category: "RAIN" },
  67: { labelJa: "強い着氷雨", category: "RAIN" },

  71: { labelJa: "軽い雪", category: "SNOW" },
  73: { labelJa: "雪", category: "SNOW" },
  75: { labelJa: "強い雪", category: "SNOW" },
  77: { labelJa: "雪粒", category: "SNOW" },

  80: { labelJa: "弱いにわか雨", category: "RAIN" },
  81: { labelJa: "中程度のにわか雨", category: "RAIN" },
  82: { labelJa: "激しいにわか雨", category: "RAIN" },

  85: { labelJa: "軽いにわか雪", category: "SNOW" },
  86: { labelJa: "強いにわか雪", category: "SNOW" },

  95: { labelJa: "雷雨", category: "THUNDER" },
  96: { labelJa: "雹を伴う雷雨", category: "THUNDER" },
  99: { labelJa: "激しい雹を伴う雷雨", category: "THUNDER" },
};
