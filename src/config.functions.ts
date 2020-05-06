import { config as _config } from "firebase-functions";

export interface Config {
  instagram_graph_api: {
    access_token: string;
  };
  algolia: {
    app_id: string;
    api_key: string;
    index_name: string;
  };
  twitter: {
    consumer_key: string;
    consumer_secret: string;
    access_token: string;
    access_token_secret: string;
  };
}
const config = _config() as Config;
export default config;

// validate config is set or on when trying `firebase deploy`.
(() => {
  config.instagram_graph_api.access_token;

  config.algolia.app_id;
  config.algolia.api_key;
  config.algolia.index_name;

  config.twitter.consumer_key;
  config.twitter.consumer_secret;
  config.twitter.access_token;
  config.twitter.access_token_secret;
})();
