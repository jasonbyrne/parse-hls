import { parseAttributes } from "./parse-attributes";
import { Attributes, AttributeValue, LineType, TAG_PATTERN } from "./types";
import { toTagFriendlyName } from "./util";

export class M3ULine {
  public type: LineType;
  public tagName: string | null;
  public name: string | null;
  public attributes: Attributes;
  public content: string;

  constructor(line: string) {
    // If it's a tag
    const tagMatch = TAG_PATTERN.exec(line);
    if (tagMatch) {
      this.type = "TAG";
      this.tagName = tagMatch[1];
      this.name = toTagFriendlyName(tagMatch[1]);
      this.content = line;
      this.attributes = parseAttributes(tagMatch[2], this.name);
      return;
    }
    // Otherwise it's an Item
    this.type = "URI";
    this.tagName = "URI";
    this.name = "uri";
    this.content = line;
    this.attributes = { value: line };
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
