# parse-hls

Strongly-typed HLS manifest parser, written in TypeScript. Fast. Zero dependencies.

```
const manifest = HLS.parse(
  fs.readFileSync("./examples/cnn-chunklist-vod.m3u8", "utf8")
);

console.log(JSON.stringify(manifest, null, 2));
```

Example output:

```json
{
  "type": "master",
  "variants": [
    {
      "uri": "1080p_5800k_v4.m3u8",
      "streamInf": {
        "programId": "1",
        "bandwidth": 1466000,
        "resolution": "1280x720",
        "codecs": ["avc1.640029", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "720p_3000k_v4.m3u8",
      "streamInf": {
        "programId": "1",
        "bandwidth": 1466000,
        "resolution": "1280x720",
        "codecs": ["avc1.640029", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "480p_1600k_v4.m3u8",
      "streamInf": {
        "programId": "1",
        "bandwidth": 797000,
        "resolution": "854x480",
        "codecs": ["avc1.640028", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "360p_800k_v4.m3u8",
      "streamInf": {
        "programId": "1",
        "bandwidth": 582000,
        "resolution": "640x360",
        "codecs": ["avc1.640028", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "136p_400k_v4.m3u8",
      "streamInf": {
        "programId": "1",
        "bandwidth": 337000,
        "resolution": "240x134",
        "codecs": ["avc1.640028", "mp4a.40.2"],
        "audio": "audio-0"
      }
    },
    {
      "uri": "192k_audio_v4.m3u8",
      "streamInf": {
        "programId": "1",
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
          "programId": "1",
          "bandwidth": 35193000,
          "codecs": ["avc1.640029"],
          "uri": "1080p_5800k_iframe.m3u8"
        }
      },
      {
        "uri": "720p_3000k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": "1",
          "bandwidth": 35193000,
          "codecs": ["avc1.640029"],
          "uri": "720p_3000k_iframe.m3u8"
        }
      },
      {
        "uri": "480p_1600k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": "1",
          "bandwidth": 15070000,
          "codecs": ["avc1.640028"],
          "uri": "480p_1600k_iframe.m3u8"
        }
      },
      {
        "uri": "360p_800k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": "1",
          "bandwidth": 9385000,
          "codecs": ["avc1.640028"],
          "uri": "360p_800k_iframe.m3u8"
        }
      },
      {
        "uri": "136p_400k_iframe.m3u8",
        "iFrameStreamInf": {
          "programId": "1",
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
  "m3u": true
}
```
