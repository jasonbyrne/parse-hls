import { M3ULine } from "../m3u-line";

export class NumericTag {
  public readonly value: number | null;

  public constructor(public readonly line: M3ULine) {
    this.value = Number(line.value);
  }
}
