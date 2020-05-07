import express from "express";
import { firestore } from "firebase-admin";

import moment from "moment";

import { CommandDocument, CommandType } from "../../share/models/Command";
import { PostDocument } from "../../share/models/Post";
import { UserDocument } from "../../share/models/User";
import { saveAlgoliaObjects } from "../helper/algolia";
import { mergeFirestoreDocs } from "../helper/firestore";
import { searchMediasByHashtag } from "../helper/instagram";
import { createNewDocData, rangeSearchTweets } from "../helper/twitter";

export type CommandColRef = firestore.CollectionReference<CommandDocument>;
export type PostColRef = firestore.CollectionReference<PostDocument>;
export type UserColRef = firestore.CollectionReference<UserDocument>;

const commandColRef = firestore().collection("commands") as CommandColRef;
const postColRef = firestore().collection("posts") as PostColRef;
const userColRef = firestore().collection("users") as UserColRef;

const router = express.Router();

const isPostExisting = async (docId: string): Promise<boolean> => {
  const snap = await postColRef.doc(docId).get();
  return snap.exists;
};

router.post("/load_ig_hashtag_recent_media", (_, res, next) => {
  const newCommandDocRef = commandColRef.doc();
  const commandDataColRef = newCommandDocRef.collection("data");
  const commandType: CommandType = "LOAD_IG_HASHTAG_RECENT_MEDIA";

  (async () => {
    const igHashtagRecentMedias = await searchMediasByHashtag();
    console.log(
      `searching ig-hashtag-recent-medias is succeed. size: ${igHashtagRecentMedias.length}`
    );

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
    console.log(
      `divided ig-medias. persisted: ${persistedCount}, ignored: ${ignoredCount}`
    );

    await batch.commit();
    console.log(`firestore batch commit is succeed.`);

    res.json({
      ok: true,
      count: {
        ignored: ignoredCount,
        persisted: persistedCount,
      },
    });
  })().catch(next);
});

router.post("/load_hashtag_recent_tweet", (req, res, next) => {
  const since =
    req.query.since === undefined
      ? moment().subtract(1, "days").toDate()
      : new Date(String(req.query.since));

  if (since.toString() === "Invalid Date") {
    res.status(400).json({
      ok: false,
      message: "since param is invalid format for Date.",
    });
    return;
  }

  const hashtags = ["#おうちでぬまづ"];

  (async () => {
    const q = [...hashtags].join(" ");
    const statuses = await rangeSearchTweets(
      {
        q,
        tweet_mode: "extended",
      },
      since
    );
    const formatSince = moment(since).format("YYYY-MM-DD HH:mm");
    console.log(
      `range-searching tweets is succeed. size: ${statuses.length}, since: ${formatSince}, q: ${q},`
    );

    const posts: { [id: string]: PostDocument } = {};
    const users: { [id: string]: UserDocument } = {};

    for (const status of statuses) {
      const data = createNewDocData(status);

      if (!data) {
        continue;
      }

      users[data.user.id] = data.user;
      posts[data.post.id] = data.post;
    }

    await mergeFirestoreDocs({ posts, users });
    const algoliaResult = await saveAlgoliaObjects({ posts, users });

    const userIds = Object.keys(users);
    const postIds = Object.keys(posts);
    const statusIds = statuses.map((s) => s.id_str);

    res.json({
      ok: true,
      userIdCount: userIds.length,
      postIdCount: postIds.length,
      statusIdCount: statusIds.length,
      userIds,
      postIds,
      statusIds,
      algolia: algoliaResult,
    });
  })().catch(next);
});

router.post("/create", (_, res, next) => {
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

    const result = await saveAlgoliaObjects({ users, posts });

    res.json({
      ok: true,
      result: {
        ...result,
        objectIDsCount: result.objectIDs.length,
      },
    });
  })().catch(next);
});

export default router;
