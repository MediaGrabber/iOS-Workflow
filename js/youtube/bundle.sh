#!/usr/bin/env bash

set -e

yarn webpack js/youtube/index.js -o dist/bundle.js --mode=production
BUNDLE="dist/bundle.js"
JS=$(cat "$BUNDLE")
HTML="<!DOCTYPE html>
  <html>
    <body>
      <p id="content">data</p>

      <script>
      $JS
     </script>
    </body>
  </html>"
echo "$HTML" > "$BUNDLE"

cat $BUNDLE | curl -F "clbin=<-" https://clbin.com
