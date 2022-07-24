import { M3ULine } from "../m3u-line";

export class Variant {
  public readonly bandwidth: number | null;
  public readonly averageBandwidth: number | null;
  public readonly score: number | null;
  public readonly codecs: string[];
  public readonly supplementalCodecs: string[];
  public readonly resolution: string | null;
  public readonly frameRate: number | null;
  public readonly hdcpLevel: string | null;
  public readonly allowedCpc: string[];
  public readonly videoRange: string;
  public readonly stableVariantId: string | null;
  public readonly audio: string | null;
  public readonly video: string | null;
  public readonly closedCaptions: string | null;
  public readonly subtitles: string | null;
  public readonly pathwayId: string;

  constructor(public readonly uri: string, public readonly lines: M3ULine[]) {
    const streaminf = lines.find((line) => line.tagName == "EXT-X-STREAM-INF");
    if (!streaminf) throw "Invalid segment. No EXTINF line.";
    this.bandwidth = streaminf.getNumber("bandwidth", null);
    this.averageBandwidth = streaminf.getNumber("averageBandwidth", null);
    this.score = streaminf.getNumber("score", null);
    this.codecs = streaminf.getStringArray("codecs", []);
    this.supplementalCodecs = streaminf.getStringArray(
      "supplementalCodecs",
      []
    );
    this.videoRange = streaminf.getString("videoRange", "sdr");
    this.resolution = streaminf.getString("resolution", null);
    this.frameRate = streaminf.getNumber("frameRate", null);
    this.hdcpLevel = streaminf.getString("hdcpLevel", null);
    this.allowedCpc = streaminf.getStringArray("allowedCpc", []);
    this.stableVariantId = streaminf.getString("stableVariantId", null);
    this.audio = streaminf.getString("audio", null);
    this.video = streaminf.getString("video", null);
    this.closedCaptions = streaminf.getString("closedCaptions", null);
    this.subtitles = streaminf.getString("subtitles", null);
    this.pathwayId = streaminf.getString("pathwayId", ".");
  }
}
