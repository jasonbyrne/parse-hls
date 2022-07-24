import { M3ULine } from "../m3u-line";

export class Inf {
  public readonly duration: number | null;
  public readonly title: string | null;

  public constructor(public readonly line: M3ULine) {
    const data = (line.value || "").split(",");
    this.duration = Number(data[0]);
    this.title = data[1] || null;
  }
}
