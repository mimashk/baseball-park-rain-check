import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkHourlyWeatherForecastProps } from "../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { HourlyWeatherForecastDto } from "../dtos/HourlyWeatherForecastDto";

export function mapHourlyWeatherForecastDtoToProps(
  dto: HourlyWeatherForecastDto,
  ballPark: BallParkId
): BallParkHourlyWeatherForecastProps {
  return {
    date: dto.date,
    weatherPattern: dto.weatherPattern,
    temperature: dto.temperature,
    precipitationProbability: dto.precipitationProbability,
    rainFall: dto.rainFall,
    ballParkId: ballPark,
  };
}
