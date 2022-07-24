import { M3ULine } from "../m3u-line";

export class ImageStreamInf {
  public readonly uri: string | null;
  public readonly bandwidth: number | null;
  public readonly codecs: string[];
  public readonly resolution: string | null;
  public readonly video: string | null;

  public constructor(public readonly line: M3ULine) {
    this.bandwidth = line.getNumber("bandwidth", null);
    this.codecs = line.getStringArray("codecs", []);
    this.uri = line.getString("uri", null);
    this.resolution = line.getString("resolution", null);
    this.video = line.getString("video", null);
  }
}
