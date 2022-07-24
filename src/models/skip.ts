import { M3ULine } from "../m3u-line";

export class Skip {
  public readonly skippedSegments: number | null;
  public readonly recentlyRemovedDateranges: string;

  public constructor(public readonly line: M3ULine) {
    this.skippedSegments = line.getNumber("skippedSegments", null);
    this.recentlyRemovedDateranges = line.getString(
      "recentlyRemovedDateranges",
      ""
    );
  }
}
