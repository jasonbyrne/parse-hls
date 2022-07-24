import { M3ULine } from "../m3u-line";

export class StringTag {
  public readonly value: string | null;

  public constructor(public readonly line: M3ULine) {
    this.value = line.value;
  }
}
