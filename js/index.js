const twitter = require("./twitter");
const instagram = require("./instagram");

const sanitizeTitle = (title) => {
  return title
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

let data = document.getElementById("content").textContent;
if (typeof data === "string") {
  data = JSON.parse(data);
}

if (data.http_headers) {
  data = { ...data.http_headers, ...data };
} else if (data.extended_entities) {
  data = twitter(data);
  data["User-Agent"] =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
} else if (data.graphql) {
  data = instagram(data);
}

data.title = sanitizeTitle(data.title);
data.formats = data.formats.filter(
  (v) => v.protocol !== "m3u8_native" && v.ext !== "webm"
);

if (!data.title && data.id) {
  if (data.user && data.user.name) {
    data.title = sanitizeTitle(`${data.user.name} - ${data.id}`);
  } else {
    data.title = data.id;
  }
}

document.getElementById("content").innerHTML = JSON.stringify(data);
