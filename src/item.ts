import { M3ULine } from "./m3u-line";

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
