import { EventContext } from "firebase-functions";
import { firestore } from "firebase-admin";

import fetch from "node-fetch";

interface PubsubLogDocument {
  ok: boolean;
  json: {};
  timestamp: firestore.FieldValue;
}

export type PubsubLogColRef = firestore.CollectionReference<PubsubLogDocument>;

const onFetchMediaByScheduler = async (_: EventContext) => {
  const projectId = process.env.GCLOUD_PROJECT;
  const url = `https://${projectId}.web.app/api/command/load_ig_hashtag_recent_media`;
  const res = await fetch(url, { method: "POST" });
  const json = await res.json();

  const newLog: PubsubLogDocument = {
    ok: res.ok,
    json,
    timestamp: firestore.FieldValue.serverTimestamp(),
  };

  const pubsubLogColRef = firestore().collection(
    "pubsub_logs"
  ) as PubsubLogColRef;

  await pubsubLogColRef.add(newLog);
};

export default onFetchMediaByScheduler;
