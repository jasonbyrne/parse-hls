import { M3ULine } from "../m3u-line";

export class Tiles {
  public readonly resolution: string | null;
  public readonly layout: string | null;
  public readonly duration: number | null;

  public constructor(public readonly line: M3ULine) {
    this.resolution = line.getString("resolution", null);
    this.layout = line.getString("layout", null);
    this.duration = line.getNumber("duration", null);
  }
}
