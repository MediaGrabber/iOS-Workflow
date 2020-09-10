const sig = require("./sig");
const utils = require("./utils");

try {
  const json = document
    .getElementById("content")
    .textContent.split("\n")
  const { streamingData, videoDetails } = JSON.parse(
    JSON.parse(json[2]).player.args.player_response
  );

  const player_tokens = [ 'r', 'p1', 'r' ];
  const formats = sig
    .decipherFormats(
      [...streamingData.formats, ...streamingData.adaptiveFormats],
      player_tokens
    )
    .map(utils.addFormatMeta);
  formats.sort(utils.sortFormats);

  document.getElementById("content").innerHTML = JSON.stringify({
    title: videoDetails.title,
    player_tokens,
    formats,
  });
} catch (err) {
  document.getElementById("content").innerHTML = JSON.stringify(err);
}
