type AttributeValue = string | number | boolean | string[] | number[] | null;
type AttributePair = { key: string; value: AttributeValue };
interface Attributes {
  [key: string]: AttributeValue;
}

type LineType = "TAG" | "URI";

const TAG_PATTERN = /#EXT(?:-X-)?([^:]+):?(.*)$/;
const TAG_PAIR_SPLITTER = /([^,="]+)((="[^"]+")|(=[^,]+))*/g;

interface Line {
  type: LineType;
  tagName: string | null;
  attributes: Attributes;
  content: string;
}

const toCamelCase = (str: string) => {
  return str.split("-").reduce((all, c) => {
    if (!all) {
      all += c.toLowerCase();
      return all;
    }
    all += c.charAt(0) + c.slice(1).toLowerCase();
    return all;
  }, "");
};

const parseLine = (line: string): Line => {
  const matched = TAG_PATTERN.exec(line);
  if (matched) {
    const tagName = toCamelCase(matched[1]);
    return {
      type: "TAG",
      tagName: tagName,
      content: line,
      attributes: parseAttributes(matched[2], tagName),
    };
  } else {
    return {
      type: "URI",
      tagName: null,
      content: line,
      attributes: { uri: line },
    };
  }
};

const parseAttributes = (str: string, tagName: string): Attributes => {
  // Split the attribute string
  const matched = str.match(TAG_PAIR_SPLITTER);
  if (matched === null) {
    return {};
  }
  // Parse attributes
  const list = (() => {
    if (tagName === "inf") {
      return [
        { key: "duration", value: matched[0] },
        { key: "title", value: matched[1] },
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

  public lines: Line[] = [];
  public isMaster: boolean;
  public isVod: boolean;
  public isLive: boolean;
  public isIframes: boolean;
  public isIndependentSegments: boolean;
  public isImageStream: boolean;
  public version: number | undefined;

  private constructor(content: string) {
    content = content.trim();
    if (!content.startsWith("#EXTM3U")) {
      throw new Error("Invalid M3U8 maifest");
    }
    this.lines = content
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => parseLine(line));
    this.isMaster = this.lines.some((line) => line.tagName === "streamInf");
    this.isVod = this.lines.some((line) => line.tagName === "endlist");
    this.isLive = !this.isVod;
    this.isIframes = this.lines.some((line) => line.tagName === "iFramesOnly");
    this.isIndependentSegments = this.lines.some(
      (line) => line.tagName === "independentSegments"
    );
    this.isImageStream = this.lines.some(
      (line) => line.tagName === "imagesOnly"
    );
    this.version = (() => {
      const v = this.lines.find((line) => line.tagName == "version");
      if (v) {
        return Number(v.attributes.value);
      }
    })();
  }
}
