type AttributeValue = string | number | boolean | string[] | number[] | null;
type AttributePair = { key: string; value: AttributeValue };
interface Attributes {
  [key: string]: AttributeValue;
}

type LineType = "TAG" | "URI" | "CUSTOM" | "COMMENT";

const TAG_PATTERN = /#(?:-X-)?([^:]+):?(.*)$/;
const TAG_PAIR_SPLITTER = /([^,="]+)((="[^"]+")|(=[^,]+))*/g;

const manifestProperties: string[] = [
  "m3u",
  "version",
  "playlistType",
  "publishedTime",
  "targetduration",
  "mediaSequence",
  "discontinuitySequence",
  "imagesOnly",
  "iFramesOnly",
  "independentSegments",
  "endlist",
  "sessionKey",
  "sessionData",
  "start",
  "allowCache",
];

const mediaItemProperties: string[] = [
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
];

const renditionProperties: string[] = ["streamInf"];

const alternateRenditionsTags: string[] = [
  "media",
  "iFrameStreamInf",
  "imageStreamInf",
];

class Item {
  constructor(
    public readonly uri: string,
    public readonly properties: M3ULine[]
  ) {}

  public serialize(): any {
    const out = { uri: this.uri };
    this.properties.forEach((prop) => {
      prop.name && (out[prop.name] = prop);
    });
    return out;
  }
}

class M3ULine {
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
      this.type = this.tagName.startsWith("EXT") ? "TAG" : "CUSTOM";
    } else {
      this.type = "URI";
      this.tagName = "URI";
      this.name = "uri";
      this.content = line;
      this.attributes = { value: line };
    }
  }

  public getAttribute(key: string): AttributeValue {
    return this.attributes[key];
  }

  public setAttribute(key: string, value: AttributeValue): M3ULine {
    this.attributes[key] = value;
    return this;
  }

  public getUri(): string {
    return this.name === "uri" ? String(this.getAttribute("value")) : "";
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

const parseAttributes = (str: string, tagName: string = ""): Attributes => {
  // Split the attribute string
  const matched = str.match(TAG_PAIR_SPLITTER);
  if (matched === null) {
    return {};
  }
  // Parse attributes
  const list = (() => {
    if (tagName === "inf") {
      const duration = matched[0].split(" ");
      let additionalPairs: AttributePair[] = [];
      // Additional attributes stuffed into the duration
      if (duration.length > 0) {
        duration
          .splice(1)
          .forEach((pairStr) =>
            additionalPairs.push(parseAttributePair(pairStr))
          );
      }
      // Compile into output
      return [
        { key: "duration", value: parseFloat(duration[0]) },
        { key: "title", value: matched[1]?.trim() },
        ...additionalPairs,
      ];
    }
    return matched.map((pairStr) => parseAttributePair(pairStr));
  })();
  // Insist on unique property names
  return list.reduce((all, current: AttributePair) => {
    if (all[current.key] === undefined) {
      all[current.key] = current.value;
    }
    return all;
  }, {} as Attributes);
};

const parseAttributePair = (str: string): AttributePair => {
  /**
   * 15.0
   * METHOD=AES-128
   * URI="https://priv.example.com/key.php?r=52"
   * URI="data:text/plain;base64,AAAASnBzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAACoSEJ7zznHou8m2HbJCHvWfK10SEJ7zznHou8m2HbJCHvWfK11I88aJmwY="
   */
  const pairs = str
    .trim()
    .replace("=", "|")
    .split("|");
  if (pairs.length == 2) {
    let key = toCamelCase(pairs[0]);
    return {
      key: key,
      value: pairs[1].replace(/("|')/g, ""),
    };
  }
  const v = parseFloat(pairs[0]);
  return {
    key: "value",
    value: Number.isNaN(v) ? pairs[0] : v,
  };
};

export class HLS {
  public static parse(content: string): HLS {
    return new HLS(content);
  }

  public readonly lines: M3ULine[] = [];
  public readonly mediaItems: Item[] = [];
  public readonly streamRenditions: Item[] = [];
  public readonly iFrameRenditions: Item[] = [];
  public readonly imageRenditions: Item[] = [];
  public readonly audioRenditions: Item[] = [];
  public readonly alternateVideoRenditions: Item[] = [];
  public readonly subtitlesRenditions: Item[] = [];
  public readonly isMaster: boolean;
  public readonly isVod: boolean;
  public readonly isLive: boolean;
  public readonly isIframes: boolean;
  public readonly isIndependentSegments: boolean;
  public readonly isImageStream: boolean;
  public readonly version: number | undefined;
  public readonly totalDuration: number = 0;

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
    this.isVod = this.lines.some((line) => line.name === "endlist");
    this.isLive = !this.isVod;
    this.isIframes = this.lines.some((line) => line.name === "iFramesOnly");
    this.isIndependentSegments = this.lines.some(
      (line) => line.name === "independentSegments"
    );
    this.isImageStream = this.lines.some((line) => line.name === "imagesOnly");
    this.version = (() => {
      const v = this.lines.find((line) => line.name == "version");
      if (v) {
        return Number(v.attributes.value);
      }
    })();
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
    }
    // Chunklist
    else {
      this.mediaItems = this.accumulateItems(
        (line) => line.type == "URI",
        (line) => {
          return !!(
            line.type === "TAG" &&
            line.name &&
            mediaItemProperties.includes(line.name)
          );
        }
      );
      this.totalDuration = this.mediaItems.reduce((sum, current) => {
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
      isMaster: this.isMaster,
    };
    if (this.isMaster) {
      out.renditions = {
        streams: this.streamRenditions.map((item) => item.serialize()),
        iframeOnly: this.iFrameRenditions.map((item) => item.serialize()),
        imageOnly: this.imageRenditions.map((item) => item.serialize()),
        audio: this.audioRenditions.map((item) => item.serialize()),
        video: this.alternateVideoRenditions.map((item) => item.serialize()),
        subtitles: this.subtitlesRenditions.map((item) => item.serialize()),
      };
    } else {
      out.totalDuration = this.totalDuration;
      out.targetDuration = this.find("targetDuration")?.getAttribute("value");
      out.media = this.mediaItems.map((item) => item.serialize());
    }
    out.version = this.version;
    out.foo = "bar";
    return out;
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
