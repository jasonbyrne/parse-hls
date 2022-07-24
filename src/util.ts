import { RenditionTags, SegmentTags, VariantTags } from "./hls-rules";
import { M3ULine } from "./m3u-line";
import { EmptyTag } from "./models/empty-tag";
import { NumericTag } from "./models/numeric-tag";
import { Segment } from "./models/segment";
import { Variant } from "./models/variant";
import { TagConstructor, UriConstructor } from "./types";

export const toTagFriendlyName = (tag: string): string => {
  if (tag.startsWith("EXT")) {
    tag = tag.substring(3);
  }
  return toCamelCase(
    tag
      .split(/[- ]/)
      .filter((part) => part.length > 0)
      .filter((part, i) => !(part === "X" && i == 0))
      .join("-")
  );
};

export const toCamelCase = (str: string): string => {
  return str.split("-").reduce((all, c) => {
    if (!all) {
      all += c.toLowerCase();
      return all;
    }
    all += c.charAt(0) + c.slice(1).toLowerCase();
    return all;
  }, "");
};

export const coerce = {
  number: (value: string) => {
    return parseFloat(value);
  },
  integer: (value: string) => {
    return parseInt(value);
  },
  date: (value: string) => {
    return new Date(value);
  },
  string: (value: string) => {
    return String(value).trim();
  },
  stringArray: (value: string) => {
    return String(value).split(",");
  },
  boolean: (value: string) => {
    return value.toUpperCase() !== "NO";
  },
};

const parseLine = (line: string): M3ULine => new M3ULine(line);

export const parseLines = (content: string) =>
  content
    .split(/\r?\n/)
    // Filter out empty lines
    .filter((line) => line.trim().length > 0)
    // Filter out comment lines
    .filter((line) => !line.startsWith("# "))
    .map((line) => parseLine(line));

export const isManifestPropertyLine = (line: M3ULine) =>
  isTagLine(line) &&
  line.name &&
  !Object.keys(SegmentTags).includes(line.name) &&
  !Object.keys(RenditionTags).includes(line.name) &&
  !Object.keys(VariantTags).includes(line.name);

export const isUriLine = (line: M3ULine) => line.type === "URI" && !line.name;
export const isTagLine = (line: M3ULine) => line.type === "TAG" && !!line.name;

export const calculateTotalDurationOfSegments = (segments: Segment[]) =>
  segments.reduce((sum, current) => {
    const duration = (() => {
      const val = Number(current.duration);
      return isNaN(val) ? 0 : val;
    })();
    return sum + duration;
  }, 0);

export const exists = (lines: M3ULine[], key: string): boolean => {
  return !!find(lines, key, EmptyTag, false);
};

export const findNumber = <TDefault>(
  lines: M3ULine[],
  key: string,
  defaultValue: TDefault
) => {
  return find(lines, key, NumericTag, undefined)?.value || defaultValue;
};

export const find = <T, TDefault>(
  lines: M3ULine[],
  tagName: string,
  className: TagConstructor<T>,
  defaultValue: TDefault
): T | TDefault => {
  const line = lines.find((line) => line.tagName == tagName);
  if (!line) return defaultValue;
  return new className(line);
};

export const collect = <T>(
  lines: M3ULine[],
  filter: string | ((line: M3ULine) => boolean),
  className: TagConstructor<T>
): T[] => {
  const matches =
    typeof filter == "string"
      ? lines.filter((line) => line.tagName == filter)
      : lines.filter(filter);
  return matches.map((line) => new className(line));
};

export const accumulate = <T extends Segment | Variant>(
  lines: M3ULine[],
  until: (line: M3ULine) => boolean,
  filter: (line: M3ULine) => boolean,
  className: UriConstructor<T>
): T[] => {
  let matches: M3ULine[] = [];
  return lines.reduce((list: T[], line: M3ULine) => {
    // If this is a URI line, this is the final one for this item
    if (until(line)) {
      list.push(new className(line.getUri() || "", matches));
      // Reset
      matches = [];
    }
    // Accumulate the tags
    else if (filter(line)) {
      matches.push(line);
    }
    return list;
  }, [] as T[]);
};
