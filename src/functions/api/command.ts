import express from "express";
import fetch from "node-fetch";
import { firestore } from "firebase-admin";

import Twit from "twit";
import moment from "moment";

import { IGHashtagRecentMedia, IGPaging } from "../../share/models/IG";
import { CommandDocument, CommandType } from "../../share/models/Command";
import { PostDocument } from "../../share/models/Post";
import { UserDocument } from "../../share/models/User";
import config from "../../config.functions";
import { saveAlgoliaObjects } from "../helper/algolia";
import { mergeFirestoreDocs } from "../helper/firestore";

export type CommandColRef = firestore.CollectionReference<CommandDocument>;
export type PostColRef = firestore.CollectionReference<PostDocument>;
export type UserColRef = firestore.CollectionReference<UserDocument>;

const commandColRef = firestore().collection("commands") as CommandColRef;
const postColRef = firestore().collection("posts") as PostColRef;
const userColRef = firestore().collection("users") as UserColRef;

const router = express.Router();

const twitter = new Twit(config.twitter);

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

const searchTweets = async (
  params: Twit.Params
): Promise<Twit.Twitter.SearchResults> => {
  return new Promise((resolve, reject) => {
    twitter.get("search/tweets", params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data as any);
      }
    });
  });
};

const rangeSearchTweets = async (
  params: Twit.Params,
  since: Date
): Promise<Twit.Twitter.Status[]> => {
  const rangeStatuses: Twit.Twitter.Status[] = [];

  const loopSearch = async (maxId?: string) => {
    const { statuses } = await searchTweets({
      ...params,
      count: 100,
      result_type: "recent",
      max_id: maxId,
    });
    console.log(
      `internal loop search. result_type: recent, status count: ${statuses.length}, maxId: ${maxId}`
    );

    let isWithinRange = true;

    for (const status of statuses) {
      const createdAt = moment(new Date(status.created_at));
      const formattedCreatedAt = createdAt.format("YYYY-MM-DD HH:mm");
      const diffFromSince = createdAt.diff(since, "days", true);
      if (0 < diffFromSince) {
        console.log(
          `tweet in range.     ID: ${status.id_str}, date: ${formattedCreatedAt}, diff from since: ${diffFromSince}`
        );
        rangeStatuses.push(status);
      } else {
        console.log(
          `tweet out of range. ID: ${status.id_str}, date: ${formattedCreatedAt}, diff from since: ${diffFromSince}`
        );

        isWithinRange = false;
        break;
      }
    }

    if (isWithinRange) {
      const lastStatusId = statuses[statuses.length - 1].id_str;
      await loopSearch(lastStatusId);
    }
  };

  await loopSearch();

  return rangeStatuses;
};

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
      const provider = "twitter";
      const originalPostId = status.id_str;
      const postId = `${provider}|${originalPostId}`;

      const originalUserId = status.user.id_str;
      const screenName = status.user.screen_name;
      const userId = `${provider}|${originalUserId}`;

      const sourceUrl = `https://twitter.com/${screenName}/status/${originalPostId}`;

      const newUserDocRef = userColRef.doc(userId);
      const newUserDoc: UserDocument = {
        id: userId,
        originalId: originalUserId,
        provider,
        displayName: status.user.name,
        userName: status.user.screen_name,
        profileImageUrl: status.user.profile_image_url_https,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      if (!status.entities.media || status.entities.media.length === 0) {
        console.log(
          `tweet with ID '${originalPostId}' has no media. ignore this.`
        );
        continue;
      }

      if (status.retweeted_status) {
        console.log(
          `tweet with ID '${originalPostId}' is retweet. ignore this.`
        );
        continue;
      }

      if (status.in_reply_to_status_id) {
        console.log(`tweet with ID '${originalPostId}' is reply. ignore this.`);
        continue;
      }

      const fullText = status.full_text as string; // use tweet_mode: "extended"
      const [
        inclusiveStart,
        exclusiveEnd,
      ] = status.display_text_range as number[]; // use tweet_mode: "extended"
      const displayFullText = fullText.slice(inclusiveStart, exclusiveEnd + 1);

      const mediaUrls = status.entities.media.map((entity) => {
        return entity.media_url_https;
      });

      const newPostDoc: PostDocument = {
        id: postId,
        originalId: originalPostId,
        provider,
        author: newUserDocRef,
        text: displayFullText,
        timestamp: firestore.Timestamp.fromDate(new Date(status.created_at)),
        mediaType:
          status.entities.media[0].type === "video" ? "video" : "image",
        mediaUrls,
        sourceUrl,
        deleted: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      users[userId] = newUserDoc;
      posts[postId] = newPostDoc;
    }

    const userCount = Object.keys(users).length;
    const postCount = Object.keys(posts).length;
    console.log(
      `saving target docs of post and user are created. user count: ${userCount}, post count: ${postCount}`
    );

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
