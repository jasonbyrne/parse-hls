import { M3ULine } from "../m3u-line";

export class Start {
  public readonly timeOffset: number;
  public readonly precise: boolean;

  public constructor(public readonly line: M3ULine) {
    this.timeOffset = line.getNumber("timeOffset", 0);
    this.precise = line.getBoolean("precise", false);
  }
}
