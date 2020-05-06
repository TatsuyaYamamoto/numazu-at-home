import { EventContext } from "firebase-functions";
import { firestore } from "firebase-admin";

import fetch from "node-fetch";

type PubsubType = "onLoadRecentPostByScheduler";

interface PubsubLogDocument {
  type: PubsubType;
  timestamp: firestore.FieldValue;
  data: {
    [provider: string]: {
      ok: boolean;
      body: {};
    };
  };
}

export type PubsubLogColRef = firestore.CollectionReference<PubsubLogDocument>;

const onLoadRecentPostByScheduler = async (_: EventContext) => {
  const projectId = process.env.GCLOUD_PROJECT;

  const loadInstagramUrl = `https://${projectId}.web.app/api/command/load_ig_hashtag_recent_media`;
  const resInstagram = await fetch(loadInstagramUrl, { method: "POST" });
  const jsonInstagram = await resInstagram.json();

  const loadTwitterDataUrl = `https://${projectId}.web.app/api/command/load_hashtag_recent_tweet`;
  const resTwitter = await fetch(loadTwitterDataUrl, { method: "POST" });
  const jsonTwitter = await resTwitter.json();

  const newLog: PubsubLogDocument = {
    type: "onLoadRecentPostByScheduler",
    timestamp: firestore.FieldValue.serverTimestamp(),
    data: {
      instagram: {
        ok: resInstagram.ok,
        body: jsonInstagram,
      },
      twitter: {
        ok: resTwitter.ok,
        body: jsonTwitter,
      },
    },
  };

  const pubsubLogColRef = firestore().collection(
    "pubsub_logs"
  ) as PubsubLogColRef;

  await pubsubLogColRef.add(newLog);
};

export default onLoadRecentPostByScheduler;
