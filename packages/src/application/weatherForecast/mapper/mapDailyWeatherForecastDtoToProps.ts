import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkDailyWeatherForecastProps } from "../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { DailyWeatherForecastDto } from "../dtos/DailyWeatherForecastDto";

export function mapDailyWeatherForecastDtoToProps(
  dto: DailyWeatherForecastDto,
  ballParkId: BallParkId
): BallParkDailyWeatherForecastProps {
  return {
    date: dto.date,
    weatherPattern: dto.weatherPattern,
    temperatureMin: dto.temperatureMin,
    temperatureMax: dto.temperatureMax,
    precipitationProbability: dto.precipitationProbability,
    rainFall: dto.rainFall,
    ballParkId: ballParkId,
  };
}
