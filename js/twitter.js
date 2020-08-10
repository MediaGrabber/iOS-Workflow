const twitter = (data) => {
  const video = data.extended_entities.media[0];

  if (video.additional_media_info && video.additional_media_info.title) {
    data.title = video.additional_media_info.title;
  } else {
    data.title = data.full_text.split("\n")[0].replace(/[/\\?%*:|"<>]/g, "-");
  }

  data.formats = video.video_info.variants
    .map((item, index) => {
      let type = item.content_type.split("/")[1];
      let format = item.url.match(/[\d ]{2,5}[x][\d ]{2,5}/);
      format = format ? format[0] : item.url.split("/").pop().split(".")[0];

      if (type === "mp4") {
        return {
          tbr: item.bitrate,
          protocol: "https",
          format: `${index} - ${format}`,
          url: item.url,
          ext: type,
          format_id: index,
        };
      }
    })
    .filter((f) => f);

  return data;
};

module.exports = twitter;
