import { M3ULine } from "../m3u-line";

export class ServerControl {
  public readonly canSkipUntil: number | null;
  public readonly canSkipDateRanges: boolean | null;
  public readonly holdBack: number | null;
  public readonly partHoldBack: number | null;
  public readonly canBlockReload: boolean;

  public constructor(public readonly line: M3ULine) {
    this.canSkipUntil = line.getNumber("canSkipUntil", null);
    this.canSkipDateRanges = line.getBoolean("canSkipDateRanges", null);
    this.holdBack = line.getNumber("holdBack", null);
    this.partHoldBack = line.getNumber("partHoldBack", null);
    this.canBlockReload = line.getBoolean("canBlockReload", false);
  }
}
