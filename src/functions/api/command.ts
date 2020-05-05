import express from "express";
import fetch from "node-fetch";
import { firestore } from "firebase-admin";
import algoliasearch from "algoliasearch";

import config from "../../config.functions";
import { IGHashtagRecentMedia, IGPaging } from "../../share/models/IG";
import { CommandDocument, CommandType } from "../../share/models/Command";
import { PostDocument } from "../../share/models/Post";
import { UserDocument } from "../../share/models/User";
import { AlgoliaObject } from "../../share/models/Algolia";

export type CommandColRef = firestore.CollectionReference<CommandDocument>;
export type PostColRef = firestore.CollectionReference<PostDocument>;
export type UserColRef = firestore.CollectionReference<UserDocument>;

const router = express.Router();

const searchMediasByHashtag = async (): Promise<IGHashtagRecentMedia[]> => {
  const instagramBusinessAccountId = "17841412231763694";
  const hashTagId = `17870480920696380`;
  const accessToken = config.instagram_graph_api.access_token;
  const fields: string = ["id", "caption", "permalink"].join(",");

  const recentMediaUrl = `https://graph.facebook.com/v6.0/${hashTagId}/recent_media?fields=${fields}&user_id=${instagramBusinessAccountId}&access_token=${accessToken}`;
  const medias: IGHashtagRecentMedia[] = [];

  const callApi = async (url: string) => {
    const res = await fetch(url);

    if (res.ok) {
      const json: {
        data: IGHashtagRecentMedia[];
        paging?: IGPaging;
      } = await res.json();
      medias.push(...json.data);

      const nextUrl = json?.paging?.next;
      if (nextUrl) {
        await callApi(nextUrl);
      }
    } else {
      const json = await res.json();
      throw new Error(JSON.stringify(json));
    }
  };

  await callApi(recentMediaUrl);

  return medias;
};

const isPostExisting = async (docId: string): Promise<boolean> => {
  const postColRef = firestore().collection("posts") as PostColRef;

  const snap = await postColRef.doc(docId).get();
  return snap.exists;
};

router.post("/load_ig_hashtag_recent_media", (_, res, next) => {
  const commandColRef = firestore().collection("commands") as CommandColRef;

  const newCommandDocRef = commandColRef.doc();
  const commandDataColRef = newCommandDocRef.collection("data");
  const commandType: CommandType = "LOAD_IG_HASHTAG_RECENT_MEDIA";

  (async () => {
    const igHashtagRecentMedias = await searchMediasByHashtag();
    const igHashtagRecentMediasSize = igHashtagRecentMedias.length;

    console.log(`igHashtagRecentMedias size: ${igHashtagRecentMediasSize}`);

    const batch = firestore().batch();

    batch.set(newCommandDocRef, {
      type: commandType,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    let persistedCount = 0;
    let ignoredCount = 0;

    for (const igMedia of igHashtagRecentMedias) {
      const originalPostId = igMedia.id;
      const postId = `instagram|${originalPostId}`;

      if (await isPostExisting(postId)) {
        ignoredCount++;
      } else {
        persistedCount++;

        const commandDataDocRef = commandDataColRef.doc(postId);
        batch.set(commandDataDocRef, igMedia, {});
      }
    }

    await batch.commit();

    res.json({
      ok: true,
      count: {
        ignored: ignoredCount,
        persisted: persistedCount,
      },
    });
  })().catch(next);
});

router.post("/create", (_, res, next) => {
  const commandColRef = firestore().collection("commands") as CommandColRef;
  const newCommandDocRef = commandColRef.doc();
  const commandDataColRef = newCommandDocRef.collection("data");

  (async () => {
    const batch = firestore().batch();

    batch.set(newCommandDocRef, {
      type: "LOAD_IG_HASHTAG_RECENT_MEDIA",
      tmp: true,
    } as any);

    const commandRefs = await commandColRef.listDocuments();
    for (const commandRef of commandRefs) {
      const dataQuerySnap = await commandRef.collection("data").get();

      for (const dataSnap of dataQuerySnap.docs) {
        const data = dataSnap.data();

        const commandDataDocRef = commandDataColRef.doc(dataSnap.id);
        batch.set(commandDataDocRef, data);
      }
    }

    await batch.commit();

    res.json({
      ok: true,
    });
  })().catch(next);
});

router.post("/reset_algolia_index", (_, res, next) => {
  const algolia = algoliasearch(config.algolia.app_id, config.algolia.api_key);
  const index = algolia.initIndex(config.algolia.index_name);
  const postColRef = firestore().collection("posts") as PostColRef;
  const userColRef = firestore().collection("users") as UserColRef;

  (async () => {
    const [postRefs, userRefs] = await Promise.all([
      postColRef.listDocuments(),
      userColRef.listDocuments(),
    ]);

    const posts: { [id: string]: PostDocument } = {};
    const users: { [id: string]: UserDocument } = {};

    await Promise.all([
      ...postRefs.map(async (postRef) => {
        const snap = await postRef.get();
        const post = snap.data();

        if (post) {
          posts[postRef.id] = post;
        }
      }),
      ...userRefs.map(async (userRef) => {
        const snap = await userRef.get();
        const user = snap.data();

        if (user) {
          users[userRef.id] = user;
        }
      }),
    ]);

    const objects: AlgoliaObject[] = Object.keys(posts).map((postId) => {
      const post = posts[postId];
      const user = users[post.author.id];

      return {
        objectID: post.id,
        text: post.text,
        authorName: user.displayName || user.userName,
        authorProfileImageUrl: user.profileImageUrl,
        mediaUrl: post.mediaUrls[0],
        timestamp: post.timestamp.toMillis(),
      };
    });

    const result = await index.saveObjects(objects);

    if (result) {
      res.json({
        ok: true,
        result: {
          ...result,
          objectIDsCount: result.objectIDs.length,
        },
      });
    } else {
      res.json({
        ok: false,
      });
    }
  })().catch(next);
});

export default router;
