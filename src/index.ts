type AttributeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Date
  | null;
type AttributePair = { key: string; value: AttributeValue };
interface Attributes {
  [key: string]: AttributeValue;
}

type LineType = "TAG" | "URI";

const TAG_PATTERN = /#(?:-X-)?([^:]+):?(.*)$/;
const TAG_PAIR_SPLITTER = /([^,="]+)((="[^"]+")|(=[^,]+))*/g;

type AttributeValueType =
  | "string"
  | "integer"
  | "number"
  | "stringArray"
  | "boolean"
  | "date";

const coerce: { [key: string]: (value: string) => AttributeValue } = {
  number: (value) => {
    return parseFloat(value);
  },
  integer: (value) => {
    return parseInt(value);
  },
  date: (value) => {
    return new Date(value);
  },
  string: (value) => {
    return String(value).trim();
  },
  stringArray: (value) => {
    return String(value).split(",");
  },
  boolean: (value) => {
    return value.toUpperCase() !== "NO";
  },
};

const knownKeys: { [key: string]: AttributeValueType } = {
  bandwidth: "integer",
  averageBandwidth: "integer",
  frameRate: "number",
  duration: "number",
  targetduration: "number",
  elapsedtime: "number",
  timeOffset: "number",
  codecs: "stringArray",
  default: "boolean",
  autoselect: "boolean",
  forced: "boolean",
  precise: "boolean",
  programDateTime: "date",
  publishedTime: "date",
  startDate: "date",
  endDate: "date",
  version: "integer",
  mediaSequence: "integer",
  discontinuitySequence: "integer",
  byterange: "string",
  key: "string",
  uri: "string",
  scte35Out: "string",
  id: "string",
  xAdId: "string",
  title: "string",
  playlistType: "string",
  method: "string",
  iv: "string",
  caid: "string",
  cue: "string",
  type: "string",
  groupId: "string",
  language: "string",
  closedCaptions: "string",
  subtitles: "string",
  audio: "string",
  video: "string",
  resolution: "string",
  instreamId: "string",
  name: "string",
  layout: "string",
  allowCache: "boolean",
  upid: "string",
  cueIn: "boolean",
  cueOut: "number",
  cueOutCont: "string",
  blackout: "boolean",
  time: "number",
  elapsed: "number",
  oatclsScte35: "string",
  scte35: "string",
  plannedDuration: "number",
  programId: "number",
  endOnNext: "boolean",
  class: "string",
  assocLanguage: "string",
  characteristics: "string",
  channels: "string",
  hdcpLevel: "string",
  dataId: "string",
  value: "string",
};

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

export class Item {
  constructor(
    public readonly uri: string,
    public readonly properties: M3ULine[]
  ) {}

  public serialize(): any {
    const out = { uri: this.uri };
    this.properties.forEach((prop) => {
      prop.name && (out[prop.name] = prop.serialize());
    });
    return out;
  }
}

export class M3ULine {
  public type: LineType;
  public tagName: string | null;
  public name: string | null;
  public attributes: Attributes;
  public content: string;

  constructor(line: string) {
    const matched = TAG_PATTERN.exec(line);
    if (matched) {
      this.tagName = matched[1];
      this.name = toTagFriendlyName(matched[1]);
      this.content = line;
      this.attributes = parseAttributes(matched[2], this.name);
      this.type = "TAG";
    } else {
      this.type = "URI";
      this.tagName = "URI";
      this.name = "uri";
      this.content = line;
      this.attributes = { value: line };
    }
  }

  public serialize(): any {
    const keys = Object.keys(this.attributes);

    return keys.length === 0
      ? true
      : keys.length === 1 && keys[0] === "value"
      ? this.attributes.value
      : this.attributes;
  }

  public getAttribute(key: string): AttributeValue {
    return this.attributes[key];
  }

  public setAttribute(key: string, value: AttributeValue): M3ULine {
    this.attributes[key] = value;
    return this;
  }

  public getUri(): string {
    return this.name === "uri"
      ? String(this.getAttribute("value"))
      : this.getAttribute("uri")
      ? String(this.getAttribute("uri"))
      : "";
  }
}

const toTagFriendlyName = (tag: string): string => {
  if (tag.startsWith("EXT")) {
    tag = tag.substr(3);
  }
  return toCamelCase(
    tag
      .split(/[- ]/)
      .filter((part) => part.length > 0)
      .filter((part, i) => !(part === "X" && i == 0))
      .join("-")
  );
};

const toCamelCase = (str: string): string => {
  return str.split("-").reduce((all, c) => {
    if (!all) {
      all += c.toLowerCase();
      return all;
    }
    all += c.charAt(0) + c.slice(1).toLowerCase();
    return all;
  }, "");
};

const parseLine = (line: string): M3ULine => new M3ULine(line);

const parseAttributes = (str: string, tag: string = ""): Attributes => {
  // Split the attribute string
  const matched = str.match(TAG_PAIR_SPLITTER);
  if (matched === null) {
    return {};
  }
  // Parse attributes
  const list = (() => {
    if (tag === "inf") {
      const duration = matched[0].split(" ");
      let additionalPairs: AttributePair[] = [];
      // Additional attributes stuffed into the duration
      if (duration.length > 0) {
        duration
          .splice(1)
          .forEach((pairStr) =>
            additionalPairs.push(parseAttributePair(pairStr, tag))
          );
      }
      // Compile into output
      return [
        { key: "duration", value: parseFloat(duration[0]) },
        { key: "title", value: matched[1]?.trim() },
        ...additionalPairs,
      ];
    }
    return matched.map((pairStr) => parseAttributePair(pairStr, tag));
  })();
  // Insist on unique property names
  return list.reduce((all, current: AttributePair) => {
    if (all[current.key] === undefined) {
      all[current.key] = current.value;
    }
    return all;
  }, {} as Attributes);
};

const parseAttributePair = (str: string, tag: string): AttributePair => {
  const pairs = str
    .trim()
    .replace("=", "|")
    .split("|");
  // Key-Value pair
  if (pairs.length == 2) {
    let key = toCamelCase(pairs[0]);
    let value: AttributeValue = pairs[1].replace(/("|')/g, "");
    if (knownKeys.hasOwnProperty(key)) {
      value = coerce[knownKeys[key]](value);
    }
    return {
      key: key,
      value: value,
    };
  }
  // Standalone value
  const value = (() => {
    // If it's a known key then we know how to map it
    if (knownKeys.hasOwnProperty(tag)) {
      return coerce[knownKeys[tag]](pairs[0]);
    }
    return Number.isNaN(pairs[0]) ? pairs[0] : parseFloat(pairs[0]);
  })();
  return {
    key: "value",
    value,
  };
};

export default HLS;

export class HLS {
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

  public get manifestProperties(): M3ULine[] {
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
      throw new Error("Invalid M3U8 maifest");
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
      out.media = this.segments.map((item) => item.serialize());
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
