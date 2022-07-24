import { M3ULine } from "../m3u-line";

export class PartInf {
  public readonly partTarget: number | null;

  public constructor(public readonly line: M3ULine) {
    this.partTarget = line.getNumber("partTarget", null);
  }
}
