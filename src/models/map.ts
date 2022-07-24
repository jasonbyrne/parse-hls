import { M3ULine } from "../m3u-line";

export class Map {
  public readonly uri: string | null;
  public readonly byterange: string | null;

  public constructor(public readonly line: M3ULine) {
    this.uri = line.getString("uri", null);
    this.byterange = line.getString("byterange", null);
  }
}
