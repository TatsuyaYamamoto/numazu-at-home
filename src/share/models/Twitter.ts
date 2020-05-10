import { Twitter } from "twit";

export interface ExtendedStatus extends Twitter.Status {
  // https://developer.twitter.com/ja/docs/ads/creatives/guides/identifying-media
  extended_entities: Twitter.Entities;
}
