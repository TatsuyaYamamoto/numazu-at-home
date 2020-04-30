import { firestore } from "firebase";

export type CommandType = "LOAD_IG_HASHTAG_RECENT_MEDIA";

export interface CommandDocument extends firestore.DocumentData {
  type: CommandType;
  createdAt: firestore.FieldValue;
}
