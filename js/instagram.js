const instagram = (data) => {
  const media = data.graphql.shortcode_media;
  data.title = media.shortcode;
  data.is_album = true;

  if (media.edge_sidecar_to_children) {
    data.formats = media.edge_sidecar_to_children.edges.map(
      ({ node: item }, index) => {
        return {
          protocol: "https",
          format: `${index} - ${item.dimensions.height}x${item.dimensions.width}`,
          url: item.is_video ? item.video_url : item.display_url,
          ext: item.is_video ? "mp4" : "jpg",
          format_id: index,
        };
      }
    );
  } else {
    data.formats = [
      {
        protocol: "https",
        format: `0 - ${media.dimensions.height}x${media.dimensions.width}`,
        url: media.is_video ? media.video_url : media.display_url,
        ext: media.is_video ? "mp4" : "jpg",
        format_id: 0,
      },
    ];
  }

  return data;
};

module.exports = instagram;
