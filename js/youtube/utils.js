const FORMATS = require("./formats");

// Use these to help sort formats, higher is better.
const audioEncodingRanks = ["mp4a", "mp3", "vorbis", "aac", "opus", "flac"];
const videoEncodingRanks = [
  "mp4v",
  "avc1",
  "Sorenson H.283",
  "MPEG-4 Visual",
  "VP8",
  "VP9",
  "H.264",
];

const getBitrate = (format) => parseInt(format.bitrate) || 0;
const audioScore = (format) => {
  const abitrate = format.audioBitrate || 0;
  const aenc = audioEncodingRanks.findIndex(
    (enc) => format.codecs && format.codecs.includes(enc)
  );
  return abitrate + aenc / 10;
};

/**
 * Sort formats from highest quality to lowest.
 * By resolution, then video bitrate, then audio bitrate.
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
const sortFormats = (a, b) => {
  const getResolution = (format) => {
    const result = /(\d+)p/.exec(format.qualityLabel);
    return result ? parseInt(result[1]) : 0;
  };
  const ares = getResolution(a);
  const bres = getResolution(b);
  const afeats = ~~!!ares * 2 + ~~!!a.audioBitrate;
  const bfeats = ~~!!bres * 2 + ~~!!b.audioBitrate;

  if (afeats === bfeats) {
    if (ares === bres) {
      let avbitrate = getBitrate(a);
      let bvbitrate = getBitrate(b);
      if (avbitrate === bvbitrate) {
        let aascore = audioScore(a);
        let bascore = audioScore(b);
        if (aascore === bascore) {
          const avenc = videoEncodingRanks.findIndex(
            (enc) => a.codecs && a.codecs.includes(enc)
          );
          const bvenc = videoEncodingRanks.findIndex(
            (enc) => b.codecs && b.codecs.includes(enc)
          );
          return bvenc - avenc;
        } else {
          return bascore - aascore;
        }
      } else {
        return bvbitrate - avbitrate;
      }
    } else {
      return bres - ares;
    }
  } else {
    return bfeats - afeats;
  }
};

/**
 * Extract string inbetween another.
 *
 * @param {string} haystack
 * @param {string} left
 * @param {string} right
 * @returns {string}
 */
const between = (haystack, left, right) => {
  let pos = haystack.indexOf(left);
  if (pos === -1) {
    return "";
  }
  haystack = haystack.slice(pos + left.length);
  pos = haystack.indexOf(right);
  if (pos === -1) {
    return "";
  }
  haystack = haystack.slice(0, pos);
  return haystack;
};

/**
 * @param {Object} format
 * @returns {Object}
 */
const addFormatMeta = (format) => {
  format = { ...FORMATS[format.itag], ...format };
  format.hasVideo = !!format.qualityLabel;
  format.hasAudio = !!format.audioBitrate;

  format.container = format.mimeType
    ? format.mimeType.split(";")[0].split("/")[1]
    : null;
  format.codecs = format.mimeType
    ? between(format.mimeType, 'codecs="', '"')
    : null;

  format.videoCodec =
    format.hasVideo && format.codecs ? format.codecs.split(", ")[0] : null;
  format.audioCodec =
    format.hasAudio && format.codecs
      ? format.codecs.split(", ").slice(-1)[0]
      : null;

  format.isLive = /\/source\/yt_live_broadcast\//.test(format.url);
  format.isHLS = /\/manifest\/hls_(variant|playlist)\//.test(format.url);
  format.isDashMPD = /\/manifest\/dash\//.test(format.url);

  // youtube-dl compatible meta
  format.ext = format.container;
  format.protocol = format.isLive || format.isHLS ? "m3u8_native" : "https";
  format.format = `${format.itag} - ${format.container}${
    format.hasAudio ? "" : " (video only)"
  }${format.hasVideo ? "" : " (audio only)"} [${format.quality}]`;

  return format;
};

module.exports = { addFormatMeta, sortFormats };
