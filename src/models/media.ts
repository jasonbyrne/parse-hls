import { M3ULine } from "../m3u-line";

export class Media {
  public readonly name: string | null;
  public readonly uri: string | null;
  public readonly type: string | null;
  public readonly groupId: string | null;
  public readonly language: string | null;
  public readonly assocLanguage: string | null;
  public readonly stableRenditionId: string | null;
  public readonly default: boolean;
  public readonly autoselect: boolean;
  public readonly forced: boolean;
  public readonly instreamId: string | null;
  public readonly characteristics: string[];
  public readonly channels: string | null;

  public constructor(public readonly line: M3ULine) {
    this.name = line.getString("name", null);
    this.uri = line.getString("uri", null);
    this.type = line.getString("type", null);
    this.type = line.getString("type", null);
    this.groupId = line.getString("groupId", null);
    this.language = line.getString("language", null);
    this.assocLanguage = line.getString("assocLanguage", null);
    this.stableRenditionId = line.getString("stableRenditionId", null);
    this.default = line.getBoolean("default", false);
    this.autoselect = line.getBoolean("autoselect", false);
    this.forced = line.getBoolean("forced", false);
    this.instreamId = line.getString("instreamId", null);
    this.characteristics = line.getStringArray("characteristics", []);
    this.channels = line.getString("channels", null);
  }
}
