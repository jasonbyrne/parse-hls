import { M3ULine } from "../m3u-line";
import { Inf } from "./inf";
import { Part } from "./part";

export class Segment {
  public readonly duration: number | null;
  public readonly title: string | null;
  public readonly parts: Part[];

  constructor(public readonly uri: string, public readonly lines: M3ULine[]) {
    const extinfLine = lines.find((line) => line.tagName == "EXTINF");
    if (!extinfLine) throw "Invalid segment. No EXTINF line.";
    const inf = new Inf(extinfLine);
    this.duration = inf.duration;
    this.title = inf.title;
    this.parts = this.lines
      .filter((line) => line.tagName == "EXT-X-PART")
      .map((line) => new Part(line));
  }
}
