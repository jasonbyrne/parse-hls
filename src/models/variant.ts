import { M3ULine } from "../m3u-line";
import { StreamInf } from "./stream-inf";

export class Variant extends StreamInf {
  constructor(
    public readonly uri: string,
    public readonly streamInfLine: M3ULine,
    public readonly properties: M3ULine[]
  ) {
    super(streamInfLine);
  }
}
