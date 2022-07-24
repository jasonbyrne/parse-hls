import { M3ULine } from "../m3u-line";
import { StringTag } from "./string-tag";

export class ByteRange extends StringTag {
  public readonly start: number;
  public readonly end: number | null;

  public constructor(public readonly line: M3ULine) {
    super(line);
    const valueArr = this.value?.split("@");
    this.start = valueArr ? Number(valueArr[0]) : 0;
    this.end = valueArr && valueArr[1] ? Number(valueArr[1]) : null;
  }
}
