const browserify = require("browserify")();
const fetch = require("node-fetch");

browserify.add("./js/index.js").bundle((err, buf) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const data = `<!DOCTYPE html>
    <html>
      <body>
        <p id="content">data</p>

        <script>
        ${buf.toString()}
        </script>
      </body>
    </html>`;

  fetch("https://paste.ubuntu.com/", {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9,bn;q=0.8",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
    },
    referrer: "https://paste.ubuntu.com/",
    referrerPolicy: "no-referrer-when-downgrade",
    body:
      "poster=body.html&syntax=html&expiration=day&content=" +
      encodeURIComponent(data),
    method: "POST",
    mode: "cors",
  })
    .then((body) => body.url)
    .then((url) => {
      console.log("Source URL: " + url);
    });
});
