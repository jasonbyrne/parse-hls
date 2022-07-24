import { M3ULine } from "../m3u-line";

export class IFrameStreamInf {
  public readonly uri: string | null;
  public readonly bandwidth: number | null;
  public readonly averageBandwidth: number | null;
  public readonly score: number | null;
  public readonly codecs: string[];
  public readonly supplementalCodecs: string[];
  public readonly resolution: string | null;
  public readonly hdcpLevel: string | null;
  public readonly allowedCpc: string[];
  public readonly videoRange: string;
  public readonly stableVariantId: string | null;
  public readonly video: string | null;
  public readonly pathwayId: string;

  public constructor(public readonly line: M3ULine) {
    this.uri = line.getString("uri", null);
    this.bandwidth = line.getNumber("bandwidth", null);
    this.averageBandwidth = line.getNumber("averageBandwidth", null);
    this.score = line.getNumber("score", null);
    this.codecs = line.getStringArray("codecs", []);
    this.supplementalCodecs = line.getStringArray("supplementalCodecs", []);
    this.videoRange = line.getString("videoRange", "sdr");
    this.resolution = line.getString("resolution", null);
    this.hdcpLevel = line.getString("hdcpLevel", null);
    this.allowedCpc = line.getStringArray("allowedCpc", []);
    this.stableVariantId = line.getString("stableVariantId", null);
    this.video = line.getString("video", null);
    this.pathwayId = line.getString("pathwayId", ".");
  }
}
