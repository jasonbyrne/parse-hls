import { M3ULine } from "./m3u-line";

export type LineType = "TAG" | "URI";

export type AttributePair = { key: string; value: string | number };

export interface Attributes {
  [key: string]: string | number;
}

export const TAG_PATTERN = /#(?:-X-)?([^:]+):?(.*)$/;
export const TAG_PAIR_SPLITTER = /([^,="]+)((="[^"]+")|(=[^,]+))*/g;

export type ManifestType = "master" | "live" | "vod";

export type TagConstructor<T> = new (line: M3ULine) => T;
export type UriConstructor<T> = new (uri: string, lines: M3ULine[]) => T;
