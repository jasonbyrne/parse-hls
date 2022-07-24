import { ByteRange } from "./models/byterange";
import { ContentSteering } from "./models/content-steering";
import { DateRange } from "./models/date-range";
import { Define } from "./models/define";
import { EmptyTag } from "./models/empty-tag";
import { IFrameStreamInf } from "./models/i-frame-stream-inf";
import { ImageStreamInf } from "./models/image-stream-inf";
import { Inf } from "./models/inf";
import { Key } from "./models/key";
import { Map } from "./models/map";
import { Media } from "./models/media";
import { NumericTag } from "./models/numeric-tag";
import { Part } from "./models/part";
import { PartInf } from "./models/part-inf";
import { PreloadHint } from "./models/preload-hint";
import { RenditionReport } from "./models/rendition-report";
import { ServerControl } from "./models/server-control";
import { SessionData } from "./models/session-data";
import { SessionKey } from "./models/session-key";
import { Skip } from "./models/skip";
import { Start } from "./models/start";
import { StreamInf } from "./models/stream-inf";
import { StringTag } from "./models/string-tag";
import { Tiles } from "./models/tiles";
import { TagConstructor } from "./types";

/**
 * Possible tag lines associated with a segment (camel-cased)
 */
export const SegmentTags: {
  [tagName: string]: TagConstructor<unknown>;
} = {
  inf: Inf,
  programDateTime: StringTag,
  key: Key,
  cueIn: StringTag,
  cueOut: StringTag,
  cueOutCont: StringTag,
  scte35: StringTag,
  asset: StringTag,
  byterange: ByteRange,
  discontinuity: EmptyTag,
  map: Map,
  beacon: StringTag,
  gap: EmptyTag,
  bitrate: NumericTag,
  part: Part,
  tiles: Tiles,
};

/**
 * Possible tag lines associated with a variant (camel-cased)
 */
export const VariantTags: {
  [tagName: string]: TagConstructor<unknown>;
} = { streamInf: StreamInf };

/**
 * Possible tag lines associated with alternate renditions (camel-cased)
 */
export const RenditionTags: {
  [tagName: string]: TagConstructor<unknown>;
} = {
  media: Media,
  iFrameStreamInf: IFrameStreamInf,
  imageStreamInf: ImageStreamInf,
};

/**
 * Tags that apply to manifest properties
 */
export const ManifestTags: {
  [tagName: string]: TagConstructor<unknown>;
} = {
  m3u: EmptyTag,
  version: NumericTag,
  contentSteering: ContentSteering,
  define: Define,
  key: Key,
  map: Map,
  partInf: PartInf,
  preloadHint: PreloadHint,
  renditionReport: RenditionReport,
  serverControl: ServerControl,
  sessionData: SessionData,
  sessionKey: SessionKey,
  start: Start,
  independentSegments: EmptyTag,
  targetduration: NumericTag,
  mediaSequence: NumericTag,
  discontinuitySequence: NumericTag,
  endlist: EmptyTag,
  playlistType: StringTag,
  iFramesOnly: EmptyTag,
  dateRange: DateRange,
  skip: Skip,
};
