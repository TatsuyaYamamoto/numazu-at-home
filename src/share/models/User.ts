import { firestore } from "firebase";
import { Provider } from "./types";

export interface UserDocument extends firestore.DocumentData {
  id: string;
  originalId: string;
  provider: Provider;

  /**
   * instagram: (perhaps) name/graph api  full_name/instagram api
   * twitter: name  https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/user-object
   */
  displayName?: string;

  /**
   * instagram: username https://developers.facebook.com/docs/instagram-api/reference/user
   * twitter: screen_name https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/user-object
   */
  userName: string;
  profileImageUrl: string;
  createdAt: firestore.FieldValue;
}

export interface User {
  id: string;
  displayName?: string;
  userName: string;
  profileImageUrl: string;
}
