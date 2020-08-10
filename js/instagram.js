const instagram = (data) => {
  const media = data.graphql.shortcode_media;
  data.title = media.shortcode;

  if (media.is_video) {
    data.formats = [
      {
        protocol: "https",
        format: `0 - ${media.dimensions.height}x${media.dimensions.width}`,
        url: media.video_url,
        ext: "mp4",
        format_id: 0,
      },
    ];
  } else {
    data.formats = [
      {
        protocol: "https",
        format: `0 - ${media.dimensions.height}x${media.dimensions.width}`,
        url: media.display_url,
        ext: "jpg",
        format_id: 0,
      },
    ];
  }

  return data;
};

module.exports = instagram;
