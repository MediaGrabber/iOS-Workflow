const util = require("./util");
const qs = require("querystring");
const urllib = require("url");

const VIDEO_URL = "https://www.youtube.com/watch?v=";
const TITLE_TO_CATEGORY = {
  song: { name: "Music", url: "https://music.youtube.com/" },
};

/**
 * Get video media.
 *
 * @param {Object} info
 * @returns {Object}
 */
exports.getMedia = (info) => {
  let media = {};
  let results = [];
  try {
    results =
      info.response.contents.twoColumnWatchNextResults.results.results.contents;
  } catch (err) {
    // Do nothing
  }

  let result = results.find((v) => v.videoSecondaryInfoRenderer);
  if (!result) {
    return {};
  }

  try {
    let metadataRows = (
      result.metadataRowContainer ||
      result.videoSecondaryInfoRenderer.metadataRowContainer
    ).metadataRowContainerRenderer.rows;
    for (let row of metadataRows) {
      if (row.metadataRowRenderer) {
        let title = row.metadataRowRenderer.title.simpleText.toLowerCase();
        let contents = row.metadataRowRenderer.contents[0];
        let runs = contents.runs;
        media[title] = runs ? runs[0].text : contents.simpleText;
        if (runs && runs[0].navigationEndpoint) {
          media[`${title}_url`] = urllib.resolve(
            VIDEO_URL,
            runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url
          );
        }
        if (title in TITLE_TO_CATEGORY) {
          media.category = TITLE_TO_CATEGORY[title].name;
          media.category_url = TITLE_TO_CATEGORY[title].url;
        }
      } else if (row.richMetadataRowRenderer) {
        let contents = row.richMetadataRowRenderer.contents;
        let boxArt = contents.filter(
          (meta) =>
            meta.richMetadataRenderer.style ===
            "RICH_METADATA_RENDERER_STYLE_BOX_ART"
        );
        for (let { richMetadataRenderer } of boxArt) {
          let meta = richMetadataRenderer;
          media.year = meta.subtitle.simpleText;
          let type = meta.callToAction.simpleText.split(" ")[1];
          media[type] = meta.title.simpleText;
          media[`${type}_url`] = urllib.resolve(
            VIDEO_URL,
            meta.endpoint.commandMetadata.webCommandMetadata.url
          );
          media.thumbnails = meta.thumbnail.thumbnails;
          // TODO: Added for backwards compatibility. Remove later.
          util.deprecate(
            media,
            "image",
            urllib.resolve(VIDEO_URL, media.thumbnails[0].url),
            "info.videoDetails.media.image",
            "info.videoDetails.media.thumbnails"
          );
        }
        let topic = contents.filter(
          (meta) =>
            meta.richMetadataRenderer.style ===
            "RICH_METADATA_RENDERER_STYLE_TOPIC"
        );
        for (let { richMetadataRenderer } of topic) {
          let meta = richMetadataRenderer;
          media.category = meta.title.simpleText;
          media.category_url = urllib.resolve(
            VIDEO_URL,
            meta.endpoint.commandMetadata.webCommandMetadata.url
          );
        }
      }
    }
  } catch (err) {
    // Do nothing.
  }

  return media;
};

/**
 * Get video author.
 *
 * @param {Object} info
 * @returns {Object}
 */
exports.getAuthor = (info) => {
  let channelId,
    avatar,
    subscriberCount,
    verified = false;
  try {
    let results =
      info.response.contents.twoColumnWatchNextResults.results.results.contents;
    let v = results.find(
      (v2) =>
        v2.videoSecondaryInfoRenderer &&
        v2.videoSecondaryInfoRenderer.owner &&
        v2.videoSecondaryInfoRenderer.owner.videoOwnerRenderer
    );
    let videoOwnerRenderer =
      v.videoSecondaryInfoRenderer.owner.videoOwnerRenderer;
    channelId = videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId;
    avatar = urllib.resolve(
      VIDEO_URL,
      videoOwnerRenderer.thumbnail.thumbnails[0].url
    );
    subscriberCount = util.parseAbbreviatedNumber(
      videoOwnerRenderer.subscriberCountText.runs[0].text
    );
    verified = !!videoOwnerRenderer.badges.find(
      (b) => b.metadataBadgeRenderer.tooltip === "Verified"
    );
  } catch (err) {
    // Do nothing.
  }
  try {
    let videoDetails =
      info.player_response.microformat.playerMicroformatRenderer;
    let id = videoDetails.channelId || channelId;
    return {
      id: id,
      name: videoDetails.ownerChannelName,
      user: videoDetails.ownerProfileUrl.split("/").slice(-1)[0],
      channel_url: `https://www.youtube.com/channel/${id}`,
      external_channel_url: `https://www.youtube.com/channel/${videoDetails.externalChannelId}`,
      user_url: urllib.resolve(VIDEO_URL, videoDetails.ownerProfileUrl),
      avatar: avatar,
      verified: verified,
      subscriber_count: subscriberCount,
    };
  } catch (err) {
    return {};
  }
};
