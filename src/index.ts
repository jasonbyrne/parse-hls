import { Item } from "./item";
import { M3ULine } from "./m3u-line";

const segmentTags: string[] = [
  "inf",
  "programDateTime",
  "key",
  "cueIn",
  "cueOut",
  "cueOutCont",
  "scte35",
  "daterange",
  "asset",
  "tiles",
  "byterange",
  "discontinuity",
  "map",
  "beacon",
  "gap",
  "partInf",
  "part",
  "skip",
];

const renditionProperties: string[] = ["streamInf"];

const alternateRenditionsTags: string[] = [
  "media",
  "iFrameStreamInf",
  "imageStreamInf",
];

const parseLine = (line: string): M3ULine => new M3ULine(line);

export default class HLS {
  public static parse(content: string): HLS {
    return new HLS(content);
  }

  public readonly lines: M3ULine[] = [];
  public readonly segments: Item[] = [];
  public readonly streamRenditions: Item[] = [];
  public readonly iFrameRenditions: Item[] = [];
  public readonly imageRenditions: Item[] = [];
  public readonly audioRenditions: Item[] = [];
  public readonly alternateVideoRenditions: Item[] = [];
  public readonly subtitlesRenditions: Item[] = [];
  public readonly closedCaptionsRenditions: Item[] = [];
  public readonly isMaster: boolean;
  public readonly isLive: boolean;
  public readonly totalDuration: number = 0;

  public get type(): "master" | "live" | "vod" {
    return this.isMaster ? "master" : this.isLive ? "live" : "vod";
  }

  public get manifestProperties(): { [key: string]: any } {
    const props: any = {};
    this.lines
      .filter(
        (line) =>
          line.name &&
          line.type !== "URI" &&
          !segmentTags.includes(line.name) &&
          !alternateRenditionsTags.includes(line.name) &&
          !renditionProperties.includes(line.name)
      )
      .forEach((line) => {
        if (line.name) {
          props[line.name] = line.serialize();
        }
      });
    return props;
  }

  private constructor(content: string) {
    content = content.trim();
    if (!content.startsWith("#EXTM3U")) {
      throw new Error("Invalid M3U8 manifest");
    }
    this.lines = content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => parseLine(line));
    this.isMaster = this.lines.some((line) => line.name === "streamInf");
    this.isLive = !this.lines.some((line) => line.name === "endlist");
    // Master Playlist
    if (this.isMaster) {
      this.streamRenditions = this.accumulateItems(
        (line) => line.type == "URI",
        (line) => {
          return !!(
            line.type === "TAG" &&
            line.name &&
            renditionProperties.includes(line.name)
          );
        }
      );
      this.iFrameRenditions = this.getStreamItems(
        (line) => line.name == "iFrameStreamInf"
      );
      this.imageRenditions = this.getStreamItems(
        (line) => line.name == "imageStreamInf"
      );
      this.audioRenditions = this.getStreamItems(
        (line) =>
          line.name == "media" &&
          String(line.getAttribute("type")).toLocaleLowerCase() == "audio"
      );
      this.alternateVideoRenditions = this.getStreamItems(
        (line) =>
          line.name == "media" &&
          String(line.getAttribute("type")).toLocaleLowerCase() == "video"
      );
      this.subtitlesRenditions = this.getStreamItems(
        (line) =>
          line.name == "media" &&
          String(line.getAttribute("type")).toLocaleLowerCase() == "subtitles"
      );
      this.closedCaptionsRenditions = this.getStreamItems(
        (line) =>
          line.name == "media" &&
          String(line.getAttribute("type")).toLocaleLowerCase() ==
            "closed-captions"
      );
    }
    // Chunklist
    else {
      this.segments = this.accumulateItems(
        (line) => line.type == "URI",
        (line) => {
          return !!(
            line.type === "TAG" &&
            line.name &&
            segmentTags.includes(line.name)
          );
        }
      );
      this.totalDuration = this.segments.reduce((sum, current) => {
        const duration = (() => {
          const val = Number(
            current.properties
              .find((prop) => prop.name === "inf")
              ?.getAttribute("duration")
          );
          return isNaN(val) ? 0 : val;
        })();
        return sum + duration;
      }, 0);
    }
  }

  public findAll(tag: string): M3ULine[] {
    tag = tag.toLocaleLowerCase();
    return this.lines.filter(
      (line) =>
        line.tagName?.toLocaleLowerCase() == tag ||
        line.name?.toLocaleLowerCase() == tag
    );
  }

  public find(tag: string): M3ULine {
    tag = tag.toLocaleLowerCase();
    return this.lines.filter(
      (line) =>
        line.tagName?.toLocaleLowerCase() == tag ||
        line.name?.toLocaleLowerCase() == tag
    )[0];
  }

  public serialize(): any {
    const out: any = {
      type: this.type,
    };
    if (this.isMaster) {
      out.variants = this.streamRenditions.map((item) => item.serialize());
      out.trickplay = {
        iframes: this.iFrameRenditions.map((item) => item.serialize()),
        images: this.imageRenditions.map((item) => item.serialize()),
      };
      out.media = {
        audio: this.audioRenditions.map((item) => item.serialize()),
        video: this.alternateVideoRenditions.map((item) => item.serialize()),
        subtitles: this.subtitlesRenditions.map((item) => item.serialize()),
        closedCaptions: this.closedCaptionsRenditions.map((item) =>
          item.serialize()
        ),
      };
    } else {
      out.segments = this.segments.map((item) => item.serialize());
      out.totalDuration = this.totalDuration;
    }
    return {
      ...out,
      ...this.manifestProperties,
    };
  }

  private getStreamItems(filter: (line: M3ULine) => boolean): Item[] {
    return this.lines
      .filter(filter)
      .map((line) => new Item(line.getUri(), [line]));
  }

  private accumulateItems(
    until: (line: M3ULine) => boolean,
    filter: (line: M3ULine) => boolean
  ): Item[] {
    let properties: M3ULine[] = [];
    return this.lines.reduce((list: Item[], line: M3ULine) => {
      // If this is a URI line, this is the final one for this item
      if (until(line)) {
        list.push(new Item(line.getUri(), properties));
        properties = [];
      }
      // Accumulate the tags
      else if (filter(line)) {
        properties.push(line);
      }
      return list;
    }, [] as Item[]);
  }
}
