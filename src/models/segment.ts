import { M3ULine } from "../m3u-line";
import { collect, exists, find, findNumber } from "../util";
import { ByteRange } from "./byterange";
import { Part } from "./part";
import { StringTag } from "./string-tag";

export class Segment {
  public readonly duration: number;
  public readonly title: string | null;
  public readonly parts: Part[];
  public readonly discontinuity: boolean;
  public readonly byteRange: ByteRange | null;
  public readonly programDate: string | null;
  public readonly isGap: boolean;
  public readonly bitrate: number | null;

  constructor(public readonly uri: string, public readonly lines: M3ULine[]) {
    const extinf = lines.find((line) => line.tagName == "EXTINF");
    if (!extinf) throw "Invalid segment. No EXTINF line.";
    const data = (extinf.value || "").split(",");
    this.duration = Number(data[0]);
    this.title = data[1] || null;
    this.parts = collect(lines, "EXT-X-PART", Part);
    this.discontinuity = exists(lines, "EXT-X-DISCONTINUITY");
    this.byteRange = find(lines, "EXT-X-BYTERANGE", ByteRange, null);
    this.programDate =
      find(lines, "EXT-X-PROGRAM-DATE-TIME", StringTag, null)?.value || null;
    this.isGap = exists(lines, "EXT-X-GAP");
    this.bitrate = findNumber(lines, "EXT-X-BITRATE", null);
  }
}
