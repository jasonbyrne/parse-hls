import { M3ULine } from "../m3u-line";

export class Key {
  public readonly method: string;
  public readonly uri: string | null;
  public readonly keyformat: string;
  public readonly keyformatversions: string;

  public constructor(public readonly line: M3ULine) {
    this.method = line.getString("method", "NONE");
    this.uri = line.getString("uri", null);
    this.keyformat = line.getString("keyformat", "identity");
    this.keyformatversions = line.getString("keyformatversions", "1");
  }
}
