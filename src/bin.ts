#!/usr/bin/node

import * as fs from 'fs';
import { exit } from 'process';
import HLS from "./index";

const args = process.argv.slice(2);

var input = "";
if (args[0] == "-") {
    var stdinBuffer = fs.readFileSync(0);
    input = stdinBuffer.toString();
} else {
    input = fs.readFileSync(args[0], "utf8")
}

const manifest = HLS(input);

console.log(JSON.stringify(manifest, null, 2));
