import { config as _config } from "firebase-functions";

export interface Config {
  instagram_graph_api: {
    access_token: string;
  };
}
const config = _config() as Config;
export default config;

// validate config is set or on when trying `firebase deploy`.
(() => {
  config.instagram_graph_api.access_token;
})();
