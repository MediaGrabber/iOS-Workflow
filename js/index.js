const twitter = require("./twitter");
const instagram = require("./instagram");

let data = document.getElementById("content").textContent;
if (typeof data === "string") {
  data = JSON.parse(data);
}

if (data.extractor) {
  data.formats = data.formats.filter((v) => v.protocol !== "m3u8_native");
  data = { ...data.http_headers, ...data };
} else if (data.extended_entities) {
  data = twitter(data);
  data["User-Agent"] =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
} else if (data.graphql) {
  data = instagram(data);
}

document.getElementById("content").innerHTML = JSON.stringify(data);
