const ytdl = require("./lib");

try {
  const url = document.getElementById("url").textContent;
  const content = document
    .getElementById("content")
    .textContent.split("\n")
    .map(JSON.parse);

  const data = ytdl.getInfo(url, content);
  document.getElementById("content").innerHTML = JSON.stringify({
    title: data.videoDetails.title,
    formats: data.formats,
  });
} catch (err) {
  document.getElementById("content").innerHTML = JSON.stringify(err);
}
