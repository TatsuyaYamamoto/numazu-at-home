/**
 * https://developers.facebook.com/docs/instagram-api/reference/hashtag/recent-media
 */
export interface IGHashtagRecentMedia {
  caption: string; //
  children?: { data: { id: string }[] }; // (only returned for Album IG Media)
  comments_count: string; //
  id: string; //
  like_count: string; //
  media_type: "IMAGE" | "CAROUSEL_ALBUM" | "VIDEO"; //
  media_url?: string; // (not returned for Album IG Media)
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
          taken_at_timestamp: number;
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

// https://stackoverflow.com/questions/42491896/how-to-retrieve-all-images-from-multiple-photo-post-on-instagram
export interface IG__A1Data {
  graphql: {
    shortcode_media: {
      display_url: string;
      edge_sidecar_to_children: {
        edges: {
          node: {
            display_url: string;
          };
        }[];
      };
    };
  };
}
