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
}
const config = _config() as Config;
export default config;

// validate config is set or on when trying `firebase deploy`.
(() => {
  config.instagram_graph_api.access_token;

  config.algolia.app_id;
  config.algolia.api_key;
  config.algolia.index_name;
})();
