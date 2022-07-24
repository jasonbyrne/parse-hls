import { M3ULine } from "../m3u-line";

export class ContentSteering {
  public readonly serverUri: string | null;
  public readonly pathwayId: string;

  public constructor(public readonly line: M3ULine) {
    this.serverUri = line.getString("serverUri", null);
    this.pathwayId = line.getString("pathwayId", ".");
  }
}
