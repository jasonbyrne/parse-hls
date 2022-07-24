import { M3ULine } from "../m3u-line";

export class RenditionReport {
  public readonly uri: string | null;
  public readonly lastMsn: number;
  public readonly lastPart: number | null;

  public constructor(public readonly line: M3ULine) {
    this.uri = this.line.getString("uri", null);
    this.lastMsn = this.line.getNumber("lastMsn", 0);
    this.lastPart = this.line.getNumber("lastPart", null);
  }
}
