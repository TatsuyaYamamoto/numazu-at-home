import {config} from "firebase-functions";

export interface Config {
  instagram_graph_api: {
    access_token: string
  };
}

export default config() as Config;
