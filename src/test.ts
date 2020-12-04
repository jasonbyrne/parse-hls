import * as fs from "fs";
import { HLS } from ".";

const manifest = HLS.parse(
  fs.readFileSync("./examples/flo-chunklist-video-vod.m3u8", "utf8")
);

console.log(JSON.stringify(manifest.serialize(), null, 2));
