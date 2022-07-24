import { M3ULine } from "../m3u-line";

export class Define {
  public readonly name: string | null;
  public readonly value: string | null;
  public readonly import: string | null;

  public constructor(public readonly line: M3ULine) {
    this.name = line.getString("name", null);
    this.value = line.getString("value", null);
    this.import = line.getString("import", null);
  }
}
