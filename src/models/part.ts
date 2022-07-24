import { M3ULine } from "../m3u-line";

export class Part {
  public readonly uri: string | null;
  public readonly duration: number | null;
  public readonly gap: boolean;
  public readonly independent: boolean;
  public byterange: string | null;

  public constructor(public readonly line: M3ULine) {
    this.uri = line.getString("uri", null);
    this.duration = line.getNumber("duration", null);
    this.gap = this.line.getBoolean("gap", false);
    this.independent = this.line.getBoolean("independent", false);
    this.byterange = this.line.getString("byterange", null);
  }
}
