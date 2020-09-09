const browserify = require("browserify")();

browserify.add("./js/youtube/index.js").bundle((err, buf) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const data = `<!DOCTYPE html>
    <html>
      <body>
        <p id="content">data</p>
        <p id="player">data</p>
        <p id="url">data</p>

        <script>
        ${buf.toString()}
        </script>
      </body>
    </html>`;

  console.log(data);
});
