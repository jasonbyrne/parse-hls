# parse-hls

Strongly-typed HLS manifest parser, written in TypeScript. Fast. Zero dependencies.

```
const manifest = HLS.parse(
  fs.readFileSync("./examples/cnn-chunklist-vod.m3u8", "utf8")
);

console.log(JSON.stringify(manifest, null, 2));
```

Example master playlist output:

```json
{
  "type": "master",
  "variants": [
    {
      "uri": "1080p_5800k_v4.m3u8",
      "streamInf": {
        "programId": 1,
        "bandwidth": 1466000,
        "resolution": "1280x720",
        "codecs": ["avc1.640029", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "720p_3000k_v4.m3u8",
      "streamInf": {
        "programId": 1,
        "bandwidth": 1466000,
        "resolution": "1280x720",
        "codecs": ["avc1.640029", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "480p_1600k_v4.m3u8",
      "streamInf": {
        "programId": 1,
        "bandwidth": 797000,
        "resolution": "854x480",
        "codecs": ["avc1.640028", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "360p_800k_v4.m3u8",
      "streamInf": {
        "programId": 1,
        "bandwidth": 582000,
        "resolution": "640x360",
        "codecs": ["avc1.640028", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "136p_400k_v4.m3u8",
      "streamInf": {
        "programId": 1,
        "bandwidth": 337000,
        "resolution": "240x134",
        "codecs": ["avc1.640028", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "192k_audio_v4.m3u8",
      "streamInf": {
        "programId": 1,
        "bandwidth": 219000,
        "codecs": ["mp4a.40.2"],
        "audio": "audio-0"
      }
    }
  ],
  "trickplay": {
    "iframes": [
      {
        "uri": "1080p_5800k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": 1,
          "bandwidth": 35193000,
          "codecs": ["avc1.640029"],
          "uri": "1080p_5800k_iframe.m3u8"
        }
      },
      {
        "uri": "720p_3000k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": 1,
          "bandwidth": 35193000,
          "codecs": ["avc1.640029"],
          "uri": "720p_3000k_iframe.m3u8"
        }
      },
      {
        "uri": "480p_1600k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": 1,
          "bandwidth": 15070000,
          "codecs": ["avc1.640028"],
          "uri": "480p_1600k_iframe.m3u8"
        }
      },
      {
        "uri": "360p_800k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": 1,
          "bandwidth": 9385000,
          "codecs": ["avc1.640028"],
          "uri": "360p_800k_iframe.m3u8"
        }
      },
      {
        "uri": "136p_400k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": 1,
          "bandwidth": 2075000,
          "codecs": ["avc1.640028"],
          "uri": "136p_400k_iframe.m3u8"
        }
      }
    ],
    "images": []
  },
  "media": {
    "audio": [
      {
        "uri": "192k_audio_v4.m3u8",
        "media": {
          "type": "AUDIO",
          "groupId": "audio-0",
          "name": "Default",
          "autoselect": true,
          "default": true,
          "uri": "192k_audio_v4.m3u8"
        }
      }
    ],
    "video": [],
    "subtitles": [],
    "closedCaptions": []
  },
  "version": 4,
  "m3u": true
}
```

Example media playlist (chunklist) output:

```json
{
  "type": "vod",
  "media": [
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_0.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_1.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_2.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_3.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_4.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_5.ts",
      "inf": {
        "duration": 5.973
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_6.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_7.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_8.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_9.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_10.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_11.ts",
      "inf": {
        "duration": 5.973
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_12.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_13.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_14.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_15.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_16.ts",
      "inf": {
        "duration": 5.973
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_17.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_18.ts",
      "inf": {
        "duration": 6.006
      }
    },
    {
      "uri": "5fc9029e498ea93ecf7fa43f-1-ABR5_19.ts",
      "inf": {
        "duration": 2.803
      }
    }
  ],
  "totalDuration": 116.818,
  "m3u": true,
  "allowCache": false,
  "mediaSequence": 0,
  "targetduration": 7,
  "version": 3,
  "playlistType": "VOD",
  "endlist": true
}
```
