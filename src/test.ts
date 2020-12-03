import * as fs from "fs";
import { HLS } from ".";

const manifest = HLS.parse(
  fs.readFileSync("./examples/chunklist-with-titles.m3u8", "utf8")
);

console.log(JSON.stringify(manifest, null, 2));
