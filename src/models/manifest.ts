import { Variant } from "./variant";
import { M3ULine } from "../m3u-line";
import { Segment } from "./segment";
import { RenditionReport } from "./rendition-report";
import { PreloadHint } from "./preload-hint";
import {
  calculateTotalDurationOfSegments,
  isManifestPropertyLine,
  isTagLine,
  parseLines,
} from "../util";
import { ManifestType, TagConstructor } from "../types";
import { RenditionTags, SegmentTags, VariantTags } from "../hls-rules";
import { IFrameStreamInf } from "./i-frame-stream-inf";
import { ImageStreamInf } from "./image-stream-inf";
import { Media } from "./media";

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
    // Master Playlist
    if (this.type == "master") {
      this.variants = this.accumulateVariants(
        (line) => line.type == "URI",
        (line) => isVariantPropertyLine(line)
      );
      this.iFrameRenditions = this.collectRenditions(
        (line) => line.tagName == "EXT-X-I-FRAME-STREAM-INF",
        IFrameStreamInf
      );
      this.imageRenditions = this.collectRenditions(
        (line) => line.tagName == "EXT-X-IMAGE-STREAM-INF",
        ImageStreamInf
      );
      this.audioRenditions = this.collectRenditions(
        (line) =>
          line.tagName == "EXT-X-MEDIA" && line.hasAttribute("type", "audio"),
        Media
      );
      this.videoRenditions = this.collectRenditions(
        (line) =>
          line.tagName == "EXT-X-MEDIA" && line.hasAttribute("type", "video"),
        Media
      );
      this.subtitlesRenditions = this.collectRenditions(
        (line) =>
          line.tagName == "EXT-X-MEDIA" &&
          line.hasAttribute("type", "subtitles"),
        Media
      );
      this.closedCaptionsRenditions = this.collectRenditions(
        (line) =>
          line.tagName == "EXT-X-MEDIA" &&
          line.hasAttribute("type", "closed-captions"),
        Media
      );
    }
    // Chunklist
    else {
      this.segments = this.accumulateSegments(
        (line) => line.type == "URI",
        (line) => isSegmentPropertyLine(line)
      );
      this.totalDuration = calculateTotalDurationOfSegments(this.segments);
    }
  }

  private collectRenditions<T>(
    filter: (line: M3ULine) => boolean,
    className: TagConstructor<T>
  ): T[] {
    return this.lines.filter(filter).map((line) => new className(line));
  }

  private accumulateVariants(
    until: (line: M3ULine) => boolean,
    filter: (line: M3ULine) => boolean
  ): Variant[] {
    let properties: M3ULine[] = [];
    return this.lines.reduce((list: Variant[], line: M3ULine) => {
      // If this is a URI line, this is the final one for this item
      if (until(line)) {
        const streamInf = properties.find(
          (line) => line.tagName == "EXT-X-STREAM-INF"
        );
        if (streamInf) {
          list.push(new Variant(line.getUri() || "", streamInf, properties));
        }
        // Reset
        properties = [];
      }
      // Accumulate the tags
      else if (filter(line)) {
        properties.push(line);
      }
      return list;
    }, [] as Variant[]);
  }

  private accumulateSegments(
    until: (line: M3ULine) => boolean,
    filter: (line: M3ULine) => boolean
  ): Segment[] {
    let tags: M3ULine[] = [];
    return this.lines.reduce((list: Segment[], line: M3ULine) => {
      // If this is a URI line, this is the final one for this item
      if (until(line)) {
        list.push(new Segment(line.getUri() || "", tags));
        tags = [];
      }
      // Accumulate the tags
      else if (filter(line)) {
        tags.push(line);
      }
      return list;
    }, [] as Segment[]);
  }
}
