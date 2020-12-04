import fs = require("fs");
import HLS from ".";

const manifest = HLS.parse(
  fs.readFileSync("./examples/nbc-chunklist-live-dvr.m3u8", "utf8")
);

console.log(JSON.stringify(manifest.serialize(), null, 2));
