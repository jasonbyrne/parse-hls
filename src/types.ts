export type LineType = "TAG" | "URI";

export type AttributeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Date
  | null;

export type AttributePair = { key: string; value: AttributeValue };

export interface Attributes {
  [key: string]: AttributeValue;
}

export const TAG_PATTERN = /#(?:-X-)?([^:]+):?(.*)$/;
export const TAG_PAIR_SPLITTER = /([^,="]+)((="[^"]+")|(=[^,]+))*/g;

export type AttributeValueType =
  | "string"
  | "integer"
  | "number"
  | "stringArray"
  | "boolean"
  | "date";
