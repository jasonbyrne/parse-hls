# parse-hls

Strongly-typed HLS manifest parser, written in TypeScript. Fast. Zero dependencies.

Early beta. Not recommended to use yet.

```
const manifest = HLS.parse(
  fs.readFileSync("./examples/cnn-chunklist-vod.m3u8", "utf8")
);

console.log(JSON.stringify(manifest, null, 2));
```
