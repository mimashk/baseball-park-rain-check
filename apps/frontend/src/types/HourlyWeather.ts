import { Weather } from "./Weather";

export type Hourly = {
  timeUtc: string;
  weather: Weather | null;
};
