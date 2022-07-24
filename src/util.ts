import { RenditionTags, SegmentTags, VariantTags } from "./hls-rules";
import { M3ULine } from "./m3u-line";
import { Segment } from "./models/segment";

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
