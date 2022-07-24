import { parseAttributes } from "./parse-attributes";
import { Attributes, LineType, TAG_PATTERN } from "./types";
import { toTagFriendlyName } from "./util";

export class M3ULine {
  public type: LineType;
  public tagName: string | null;
  public name: string | null;
  public value: string | null;
  public attributes: Attributes;

  constructor(public readonly content: string) {
    // If it's a tag
    const tagMatch = TAG_PATTERN.exec(this.content);
    if (tagMatch) {
      this.type = "TAG";
      this.tagName = tagMatch[1].toUpperCase();
      this.name = toTagFriendlyName(tagMatch[1]);
      this.value = tagMatch[2];
      this.attributes = parseAttributes(tagMatch[2], this.name);
      return;
    }
    // Otherwise it's an Item
    this.type = "URI";
    this.tagName = "URI";
    this.name = "uri";
    this.value = this.content;
    this.attributes = {};
  }

  public getBoolean<TDefault extends boolean | null = null>(
    attributeKey: string,
    defaultValue: TDefault
  ) {
    const value = this.getString(attributeKey, null);
    return value === null ? defaultValue : value.toUpperCase() == "YES";
  }

  public getString<TDefault extends string | null = null>(
    attributeKey: string,
    defaultValue: TDefault
  ) {
    const value = this.getAttribute(attributeKey);
    return value !== undefined ? String(value) : defaultValue;
  }

  public getStringArray<TDefault extends string[] | null = null>(
    attributeKey: string,
    defaultValue: TDefault
  ) {
    const value = this.getAttribute(attributeKey);
    return Array.isArray(value)
      ? value.map((v: unknown) => String(v))
      : defaultValue;
  }

  public getNumber<TDefault extends number | null = null>(
    attributeKey: string,
    defaultValue: TDefault
  ) {
    const value = this.getAttribute(attributeKey);
    return value !== undefined ? Number(value) : defaultValue;
  }

  public getAttribute(key: string): string | number {
    return this.attributes[key];
  }

  public hasAttribute(key: string, value?: string): boolean {
    if (this.attributes[key] === undefined) return false;
    if (value === undefined) return true;
    return this.getString(key, "").toLowerCase() == value.toLowerCase();
  }

  public getUri(): string | null {
    if (this.type == "URI") return this.value;
    return this.getString("uri", null);
  }
}
