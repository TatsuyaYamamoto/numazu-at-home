import { Provider } from "./types";

export interface AlgoliaObject {
  objectID: string;
  text: string;
  authorName: string;
  authorProfileImageUrl: string;
  timestamp: number;
  mediaUrl: string;
  provider: Provider;
}
