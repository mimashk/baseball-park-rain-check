export class TimeSeriesGenerator {
  static generate(input: {
    timeStartSec: number;
    timeEndSec: number;
    intervalSec: number;
  }): Date[] {
    const { timeStartSec, timeEndSec, intervalSec } = input;

    const length = (timeEndSec - timeStartSec) / intervalSec;
    if (!Number.isFinite(length) || length <= 0) return [];

    const numberOfDates = Math.floor(length);

    const dates: Date[] = [];
    for (let i = 0; i < numberOfDates; i++) {
      const sec = timeStartSec + i * intervalSec;
      dates.push(new Date(sec * 1000));
    }
    return dates;
  }
}
