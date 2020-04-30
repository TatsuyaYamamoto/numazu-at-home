/**
 * https://developers.facebook.com/docs/instagram-api/reference/hashtag/recent-media
 */
export interface IGHashtagRecentMedia {
  caption: string; //
  children?: { permalink: string }[]; // (only returned for Album IG Media)
  comments_count: string; //
  id: string; //
  like_count: string; //
  media_type: "IMAGE" | "CAROUSEL_ALBUM" | "VIDEO"; //
  media_url: string; // (not returned for Album IG Media)
  permalink: string; //
}

export interface IGPaging {
  cursors?: {
    after?: string;
  };
  next?: string;
}

export interface IGSharedData {
  entry_data: {
    PostPage: {
      graphql: {
        shortcode_media: {
          id: string;
          shortcode: string;
          display_url: string;
          is_video: boolean;
          taken_at_timestamp: string;
          location: {
            id: string;
            name: string;
          };
          owner: {
            id: string;
            profile_pic_url: string;
            username: string;
            full_name: string;
          };
        };
      };
    }[];
  };
}
