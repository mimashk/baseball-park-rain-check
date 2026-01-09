import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkObservedHourlyWeatherProps } from "../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { ObservedHourlyWeatherDto } from "../dtos/ObservedHourlyWeatherDto";

export function mapObservedHourlyWeatherDtoToProps(
  dto: ObservedHourlyWeatherDto,
  ballParkId: BallParkId
): BallParkObservedHourlyWeatherProps {
  return {
    date: dto.date,
    temperature: dto.temperature,
    rainFall: dto.rainFall,
    ballParkId: ballParkId,
  };
}
