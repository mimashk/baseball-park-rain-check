import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureTextPresent } from "../../shared/ensurePresent";
import { ensureValidDate } from "../../shared/ensureValidDate";

export class ModelVersion {
  private constructor(private readonly _value: string) {}

  static fromDate(date: Date): ModelVersion {
    const normalizedDate = ensureValidDate("モデルバージョンの日付", date);
    const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
    const year = normalizedDate.getFullYear();
    const month = pad(normalizedDate.getMonth() + 1);
    const day = pad(normalizedDate.getDate());
    const hour = pad(normalizedDate.getHours());
    const minute = pad(normalizedDate.getMinutes());
    return new ModelVersion(`v${year}${month}${day}${hour}${minute}`);
  }
  static fromString(value: string): ModelVersion {
    const normalizedValue = ensureTextPresent("モデルバージョン", value);
    if (!/^v?\d{12}$/.test(normalizedValue)) {
      throw new ValidationError("モデルバージョンの形式が不正です", {
        normalizedValue,
      });
    }
    return new ModelVersion(value);
  }

  toString(): string {
    return this._value;
  }

  toDate(): Date {
    const v = this._value.startsWith("v") ? this._value.slice(1) : this._value;
    const year = Number(v.slice(0, 4));
    const month = Number(v.slice(4, 6)) - 1;
    const day = Number(v.slice(6, 8));
    const hour = Number(v.slice(8, 10));
    const minute = Number(v.slice(10, 12));
    const date = new Date(year, month, day, hour, minute);
    if (Number.isNaN(date.getTime())) {
      throw new ValidationError("モデルバージョンの日時が解釈できません", {
        value: this._value,
      });
    }
    return date;
  }
}
