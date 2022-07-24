import { M3ULine } from "../m3u-line";

export class PreloadHint {
  public readonly uri: string | null;
  public readonly type: string | null;
  public readonly byterangeStart: number;
  public readonly byterangeLength: number | null;

  public constructor(public readonly line: M3ULine) {
    this.uri = this.line.getString("uri", null);
    this.type = this.line.getString("type", null);
    this.byterangeStart = this.line.getNumber("byterangeStart", 0);
    this.byterangeLength = this.line.getNumber("byterangeLength", null);
  }
}
