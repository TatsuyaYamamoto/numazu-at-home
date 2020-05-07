import { firestore } from "firebase/app";
import { firestore as firebaseAdmin } from "firebase-admin";

import { UserDocument } from "./User";
import { Provider } from "./types";

export type MediaType = "image" | "video";

export interface PostDocument extends firestore.DocumentData {
  id: string;
  originalId: string;
  provider: Provider;
  author:
    | firestore.DocumentReference<UserDocument>
    | firebaseAdmin.DocumentReference<UserDocument>;
  text: string;
  timestamp: firestore.Timestamp;
  mediaType: MediaType;
  mediaUrls: string[];
  sourceUrl: string;
  deleted: boolean;
  createdAt: firestore.FieldValue;
}

export interface Post {
  id: string;
  authorId: string;
  text: string;
  timestamp: Date;
  mediaUrls: string[];
  sourceUrl: string;
  provider: Provider;
}
