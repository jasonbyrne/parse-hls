import { Variant } from "./variant";
import { M3ULine } from "../m3u-line";
import { Segment } from "./segment";
import { RenditionReport } from "./rendition-report";
import { PreloadHint } from "./preload-hint";
import {
  accumulate,
  calculateTotalDurationOfSegments,
  collect,
  exists,
  find,
  findNumber,
  isManifestPropertyLine,
  isTagLine,
  parseLines,
} from "../util";
import { ManifestType, TagConstructor, UriConstructor } from "../types";
import {
  ManifestTags,
  RenditionTags,
  SegmentTags,
  VariantTags,
} from "../hls-rules";
import { IFrameStreamInf } from "./i-frame-stream-inf";
import { ImageStreamInf } from "./image-stream-inf";
import { Media } from "./media";
import { NumericTag } from "./numeric-tag";
import { EmptyTag } from "./empty-tag";
import { Start } from "./start";
import { Define } from "./define";
import { PartInf } from "./part-inf";
import { ServerControl } from "./server-control";
import { Key } from "./key";
import { Map } from "./map";

export const isMasterManifest = (lines: M3ULine[]) =>
  lines.some((line) => line.name === "streamInf");

export const isVodManifest = (lines: M3ULine[]) =>
  lines.some((line) => line.name === "endlist");

export const isRenditionPropertyLine = (line: M3ULine) =>
  isTagLine(line) && Object.keys(RenditionTags).includes(line.name || "");

export const isVariantPropertyLine = (line: M3ULine) =>
  isTagLine(line) && Object.keys(VariantTags).includes(line.name || "");

export const isSegmentPropertyLine = (line: M3ULine) =>
  isTagLine(line) && Object.keys(SegmentTags).includes(line.name || "");

export class Manifest {
  public readonly type: ManifestType;
  public readonly lines: M3ULine[] = [];
  public readonly segments: Segment[] = [];
  public readonly variants: Variant[] = [];
  public readonly iFrameRenditions: IFrameStreamInf[] = [];
  public readonly imageRenditions: ImageStreamInf[] = [];
  public readonly audioRenditions: Media[] = [];
  public readonly videoRenditions: Media[] = [];
  public readonly subtitlesRenditions: Media[] = [];
  public readonly closedCaptionsRenditions: Media[] = [];
  public readonly totalDuration: number = 0;
  public readonly version: number | null = null;
  public readonly independentSegments: boolean = false;
  public readonly start: Start | null = null;
  public readonly define: Define[];
  public readonly targetDuration: number | null;
  public readonly mediaSequence: number | null;
  public readonly discontinuitySequence: number | null;
  public readonly endlist: boolean;
  public readonly iFramesOnly: boolean;
  public readonly imagesOnly: boolean;
  public readonly partInf: PartInf | null;
  public readonly serverControl: ServerControl | null;
  public readonly keys: Key[];
  public readonly maps: Map[];

  public get renditionReports(): RenditionReport[] {
    return this.lines
      .filter((line) => line.name == "renditionReport")
      .map((line) => new RenditionReport(line));
  }

  public get preloadHints(): PreloadHint[] {
    return this.lines
      .filter((line) => line.name == "preloadHint")
      .map((line) => new PreloadHint(line));
  }

  public constructor(content: string) {
    content = content.trim();
    if (!content.startsWith("#EXTM3U")) {
      throw new Error("Invalid M3U8 manifest");
    }
    this.lines = parseLines(content);
    this.type = isMasterManifest(this.lines)
      ? "master"
      : isVodManifest(this.lines)
      ? "vod"
      : "live";
    this.version = this.findNumber("EXT-X-VERSION", null);
    this.targetDuration = this.findNumber("EXT-X-TARGETDURATION", null);
    this.mediaSequence = this.findNumber("EXT-X-MEDIA-SEQUENCE", null);
    this.discontinuitySequence = this.findNumber(
      "EXT-X-DISCONTINUITY-SEQUENCE",
      null
    );
    this.independentSegments = this.exists("EXT-X-INDEPENDENT-SEGMENTS");
    this.start = this.find("EXT-X-START", Start, null);
    this.define = this.collect("EXT-X-DEFINE", Define);
    this.keys = this.collect("EXT-X-KEY", Key);
    this.maps = this.collect("EXT-X-MAP", Map);
    this.endlist = this.exists("EXT-X-ENDLIST");
    this.iFramesOnly = this.exists("EXT-X-I-FRAMES-ONLY");
    this.imagesOnly = this.exists("EXT-X-IMAGES-ONLY");
    this.partInf = this.find("EXT-X-PART-INF", PartInf, null);
    this.serverControl = this.find("EXT-X-SERVER-CONTROL", ServerControl, null);
    // Master Playlist
    if (this.type == "master") {
      this.variants = this.accumulate(
        (line) => line.type == "URI",
        (line) => isVariantPropertyLine(line),
        Variant
      );
      this.iFrameRenditions = this.collect(
        (line) => line.tagName == "EXT-X-I-FRAME-STREAM-INF",
        IFrameStreamInf
      );
      this.imageRenditions = this.collect(
        (line) => line.tagName == "EXT-X-IMAGE-STREAM-INF",
        ImageStreamInf
      );
      this.audioRenditions = this.collect(
        (line) =>
          line.tagName == "EXT-X-MEDIA" && line.hasAttribute("type", "audio"),
        Media
      );
      this.videoRenditions = this.collect(
        (line) =>
          line.tagName == "EXT-X-MEDIA" && line.hasAttribute("type", "video"),
        Media
      );
      this.subtitlesRenditions = this.collect(
        (line) =>
          line.tagName == "EXT-X-MEDIA" &&
          line.hasAttribute("type", "subtitles"),
        Media
      );
      this.closedCaptionsRenditions = this.collect(
        (line) =>
          line.tagName == "EXT-X-MEDIA" &&
          line.hasAttribute("type", "closed-captions"),
        Media
      );
    }
    // Chunklist
    else {
      this.segments = this.accumulate(
        (line) => line.type == "URI",
        (line) => isSegmentPropertyLine(line),
        Segment
      );
      this.totalDuration = calculateTotalDurationOfSegments(this.segments);
    }
  }

  private exists(key: string): boolean {
    return exists(this.lines, key);
  }

  private findNumber<TDefault>(key: string, defaultValue: TDefault) {
    return findNumber(this.lines, key, defaultValue);
  }

  private find<T, TDefault>(
    tagName: string,
    className: TagConstructor<T>,
    defaultValue: TDefault
  ): T | TDefault {
    return find(this.lines, tagName, className, defaultValue);
  }

  private collect<T>(
    filter: string | ((line: M3ULine) => boolean),
    className: TagConstructor<T>
  ): T[] {
    return collect(this.lines, filter, className);
  }

  private accumulate<T extends Segment | Variant>(
    until: (line: M3ULine) => boolean,
    filter: (line: M3ULine) => boolean,
    className: UriConstructor<T>
  ): T[] {
    return accumulate(this.lines, until, filter, className);
  }
}
