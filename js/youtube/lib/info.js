const urllib = require("url");
const querystring = require("querystring");
const util = require("./util");
const extras = require("./info-extras");
const sig = require("./sig");

const VIDEO_URL = "https://www.youtube.com/watch?v=";
const EMBED_URL = "https://www.youtube.com/embed/";
const VIDEO_EURL = "https://youtube.googleapis.com/v/";
const INFO_HOST = "www.youtube.com";
const INFO_PATH = "/get_video_info";

/**
 * Gets info from a video without getting additional formats.
 *
 * @param {string} id
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const getBasicInfo = (id, body, options = {}) => {
  let info = body.reduce((part, curr) => Object.assign(curr, part), {});
  let playErr = util.playError(info, "ERROR");
  if (playErr) {
    throw playErr;
  }

  if (!info.player) {
    throw Error("Could not find player config");
  }

  return gotConfig(id, options, info, body);
};

/**
 * @param {Object} info
 * @returns {Array.<Object>}
 */
const parseFormats = (info) => {
  let formats = [];
  if (info.player_response.streamingData) {
    if (info.player_response.streamingData.formats) {
      formats = formats.concat(info.player_response.streamingData.formats);
    }
    if (info.player_response.streamingData.adaptiveFormats) {
      formats = formats.concat(
        info.player_response.streamingData.adaptiveFormats
      );
    }
  }
  return formats;
};

/**
 * @param {Object} id
 * @param {Object} options
 * @param {Object} info
 * @param {string} body
 * @returns {Promise<Object>}
 */
const gotConfig = (id, options, info, body) => {
  let player_response =
    info.player && info.player.args && info.player.args.player_response;

  if (typeof player_response === "object") {
    info.player_response = player_response;
  } else {
    try {
      info.player_response = JSON.parse(player_response);
    } catch (err) {
      throw Error(`Error parsing \`player_response\`: ${err.message}`);
    }
  }

  info.formats = parseFormats(info);

  // Add additional properties to info.
  let additional = {
    author: extras.getAuthor(info),
    media: extras.getMedia(info),
    age_restricted: !!(info.player.args && info.player.args.is_embed),

    // Give the standard link to the video.
    video_url: VIDEO_URL + id,
  };

  info.videoDetails = Object.assign(
    {},
    info.player_response.microformat.playerMicroformatRenderer,
    info.player_response.videoDetails,
    additional
  );
  info.html5player = info.player && info.player.assets && info.player.assets.js;

  // TODO: Remove these warnings later and remove the properties.
  // Remember to remove from typings too.
  for (let [prop, value] of Object.entries(additional)) {
    util.deprecate(
      info,
      prop,
      value,
      `info.${prop}`,
      `info.videoDetails.${prop}`
    );
  }
  util.deprecate(
    info,
    "published",
    info.player_response.microformat.playerMicroformatRenderer.publishDate,
    "info.published",
    "info.videoDetails.publishDate"
  );
  let props = {
    description: "shortDescription",
    video_id: "videoId",
    title: "title",
    length_seconds: "lengthSeconds",
  };
  for (let [oldProp, newProp] of Object.entries(props)) {
    util.deprecate(
      info,
      oldProp,
      info.videoDetails[newProp],
      `info.${oldProp}`,
      `info.videoDetails.${newProp}`
    );
  }

  delete info.playerResponse;
  delete info.response;
  delete info.contents;
  delete info.player;
  delete info.player_response;
  delete info.availableCountries;
  return info;
};

/**
 * Gets info from a video additional formats and deciphered URLs.
 *
 * @param {string} id
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const getInfo = (id, body, options = {}) => {
  let info = getBasicInfo(id, body);
  const hasManifest =
    info.player_response &&
    info.player_response.streamingData &&
    (info.player_response.streamingData.dashManifestUrl ||
      info.player_response.streamingData.hlsManifestUrl);
  let funcs = [];
  if (info.formats.length) {
    const html5player = urllib.resolve(VIDEO_URL, info.html5player);
    funcs.push(sig.decipherFormats(info.formats, html5player, options));
  }

  info.formats = Object.values(Object.assign({}, ...funcs));
  info.formats = info.formats.map(util.addFormatMeta);
  info.formats.sort(util.sortFormats);
  info.full = true;
  return info;
};

module.exports = { getBasicInfo, getInfo };
