import { M3ULine } from "../m3u-line";

export class DateRange {
  public readonly id: string | null;
  public readonly startDate: string | null;
  public readonly cue: string | null;
  public readonly endDate: string | null;
  public readonly duration: number | null;
  public readonly plannedDuration: number | null;
  public readonly scte35In: string | null;
  public readonly scte35Out: string | null;
  public readonly scte35Cmd: string | null;
  public readonly endOnNext: boolean;

  public constructor(public readonly line: M3ULine) {
    this.id = line.getString("id", null);
    this.startDate = line.getString("startDate", null);
    this.cue = line.getString("cue", null);
    this.endDate = line.getString("endDate", null);
    this.duration = line.getNumber("duration", null);
    this.plannedDuration = line.getNumber("plannedDuration", null);
    this.scte35In = line.getString("scte35In", null);
    this.scte35Out = line.getString("scte35Out", null);
    this.scte35Cmd = line.getString("scte35Cmd", null);
    this.endOnNext = line.getBoolean("endOnNext", false);
  }
}
